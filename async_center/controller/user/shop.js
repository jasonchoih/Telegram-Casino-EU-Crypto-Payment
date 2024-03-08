// 
const dayjs = require('dayjs');
const { sequelize, Op, USERS, USERDATA, USERLOGBANK, USERCARD, USERDAYDATA, USERSUM } = require('../../sequelize/db28');
const { redis_2_pub } = require('../../tool/redis');
const { KMID } = require('../../tool/cryptos');
const { UserDaySumCheck } = require('../../service/usersum');
const { TCL } = require('../../service/transaction');
const { LsCheck } = require('../../service/liushui');
// 
const dui = async(d) => 
{
    let { id, money, time, telegram_id } = d;
    // 
    const _user = await USERS.findOne({attributes: ['nick','name'],where:{ id }});
    // 
    money = parseInt(money);
    // 统计检查加入
    const _time = dayjs().format('YYYY-MM-DD');
    await UserDaySumCheck({
        user_id: id,
        time: _time
    });
    // 
    let _re = await TCL(async(transaction)=>
    {
        const { dou,bank } = await USERDATA.findOne({ 
            attributes: ['dou','bank'], 
            where:{ user_id:id }
        }, { transaction });
        // 
        const user_bank = parseInt(bank);
        let km_dou = parseInt(money*1000);
        // 
        const ls = await LsCheck({user_id:id, transaction});
        let exchange_rate = 0;
        if(ls)
        {
            exchange_rate = parseInt(km_dou*ls);
            km_dou = parseInt( km_dou + exchange_rate );
        }
        // 
        if(user_bank<km_dou) throw new Error(1);
        //
        const user_new_bank = parseInt(user_bank - km_dou);
        //
        await USERDATA.update({ bank: user_new_bank }, { where:{
            [Op.and]: [
                { user_id: id }, 
                { bank: {[Op.gte]: 0} },
            ],
        }, transaction });
        await USERLOGBANK.create({
            user_id: id,
            type: 3,
            num: km_dou,
            dou,
            bank: user_new_bank,
            time
        }, { transaction });
        // 
        const km = money+'-'+await KMID();
        const _user_crad = await USERCARD.create({
            user_id: id,
            user_name: _user.name,
            km,
            rate: exchange_rate,
            money,
            status: 1,
            time
        }, { transaction });
        // 今日总体数据记录
        await sequelize.query(
            'UPDATE `user_day_data` SET '+
            '`exchange_num`=`exchange_num` + 1, '+
            '`exchange`=`exchange` + '+money+', '+
            '`exchange_rate`=`exchange_rate` + '+exchange_rate+' '+
            'WHERE user_id='+id+' and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_sum` SET '+
            '`exchange_num`=`exchange_num` + 1, '+
            '`exchange`=`exchange` + '+money+', '+
            '`exchange_rate`=`exchange_rate` + '+exchange_rate+' '+
            'WHERE user_id='+id, 
            { transaction }
        );
        // 
        return { 
            user_new_bank,
            km,
            km_id: _user_crad.id
        };
    });
    // 
    if(!_re) return '兑换失败，请稍后再试1！' 
    if(_re==1) return '银行金豆不足，请先将金豆余额存入银行后再试！'
    // 
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({KamiDuihuang:[
        dayjs().format('MM-DD HH:mm:ss'),
        id,
        _user.nick,
        _re.km,
        1,
        _re.km_id
    ]}));
    // 
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({ HomeSum: {
        user_exchanges: money
    }}));
    // 
    return "您的 $" + money + " 提款请求已被接受 请耐心等待交易完成。如有任何问题或需要帮助，请随时联系客户服务 https://t.me/jlfc_kf" + '\n\n' +
    '您的 ID：' + telegram_id + '\n' + 
    '时间：' + time
}
// 
module.exports = {
    dui
}