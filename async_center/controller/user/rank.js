// 
const dayjs = require('dayjs');
const { get_2 } = require('../../tool/redis');
const { Op, USERS, USERDATA, USERPHB, USERDAYDATA, USERLOGDOU } = require('../../sequelize/db28');
const { UserDaySumCheck } = require('../../service/usersum');
const { TCL,TCC } = require('../../service/transaction');

// 排行榜更新
const rank_update = async(d) => 
{
    const { user_id, rank } = d;
    // 
    const _user = await USERS.findOne({where:{id:user_id}});
    if(!_user) return;
    // 
    const yestoday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    // 统计检查
    await UserDaySumCheck({
        user_id,
        time: yestoday
    });
    // 
    await TCL(async(transaction)=>
    {
        await USERDAYDATA.update({ rank, phb:1 }, { where:{
            user_id,
            time: yestoday
        }, transaction });
    });
    return;
}
//
const go = async(d) => 
{
    const { id } = d;
    // 
    const yestoday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const _yser_day_data = await USERDAYDATA.findOne({attributes:['id','rank','phb','time'],where:{user_id:id,time:yestoday}});
    // 
    if(!_yser_day_data)
    {
        return { M:{c:'没有上榜或已领取！'}, UserPhbLoading:''}
    }
    const time_start = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const time_end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    const _phb_lq = await USERPHB.findOne({
        where:
        {
            user_id: id, 
            time:{
                [Op.gte]: time_start,
                [Op.lte]: time_end,
            }
        }
    });
    if(_phb_lq)
    {
        return { M:{c:'昨日排行榜奖励已领取过，请明天再来领取'}, UserPhbLoading:''}
    }
    // 
    const _phb = await get_2('PhbjlSet');
    const rank = _yser_day_data.rank;
    const num = _phb['p'+rank];
    //
    let _re = await TCL(async(transaction)=>
    {
        const _user_data = await USERDATA.findOne({ 
            attributes: ['dou'], 
            where:{ 
                user_id: id
            } 
        }, { transaction });
        // 
        if(!_user_data) throw new Error(1);
        const _user_old_dou = parseInt(_user_data.dou);
        const _user_new_dou = parseInt(_user_old_dou+parseInt(num));
        //
        await USERDATA.update({ dou: _user_new_dou }, { where:{
            [Op.and]: [
                { user_id: id }, 
                { dou: {[Op.gte]: 0} }
            ],
        }, transaction });
        await USERDAYDATA.update({ phb:2 }, { where:{
            id: _yser_day_data.id,
            user_id:id,
            time: yestoday
        }, transaction });
        await USERPHB.create({
            user_id: id,
            rank,
            num,
            dou: _user_new_dou,
            status: 2,
            time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }, { transaction });
        // 金豆日志
        await USERLOGDOU.create({
            user_id: id,
            type: 67,
            mode: 2,
            num,
            dou: _user_new_dou,
            des: '第 '+rank+' 名',
            time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }, { transaction });
        // 
        return { 
            _user_new_dou
        }
    });
    if(!_re) return {M:{c:'排行榜领取失败，请稍后再试！'}, UserPhbLoading:''};
    if(_re==1) return {M:{c:'排行榜领取失败1，请稍后再试！'}, UserPhbLoading:''};
    // 
    return {
        Auth:{dou: _re._user_new_dou},
        UserPhbLoading:'',
        M:{c:'恭喜您，领取排行榜成功！'},
        UserPhbReload: dayjs().valueOf()
    }
}
// 
module.exports = {
    rank_update,
    go
}