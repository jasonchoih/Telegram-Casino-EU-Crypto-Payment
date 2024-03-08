//
const dayjs = require('dayjs');
const { 
    sequelize,Transaction,Op, 
    USERS, USERDATA, USERBET, USERLOGDOU
} = require('../../sequelize/db28');
const { GameName, objNumSum, nTom } = require('../../tool/tool');
const { redis_2_pubs, redis_2_lpush, redis_2_ltrim } = require('../../tool/redis');
const { getGameBetData,fouChange,UserBetDataCheck,UserDaySumCheck } = require('../../service/usersum');
const { TCL,TCC } = require('../../service/transaction');
const { tgBetAdd } = require('../../service/usertgfl');
const { lsre } = require('../../service/betls');
// 
// 手动投注
const bet = async(d) => 
{
    let { id, time, category, type, vals, peroids, mode, telegram_chat, nick, telegram_id } = d;
    // 
    let { dou, num } = await objNumSum(vals);
    dou = Math.ceil(dou / 1000) * 1000;
    // 
    const _user = await USERS.findOne({ 
        attributes: ['nick','parent'], 
        where:{ id } 
    });
    // if(!_user) return {M:{c:'投注失败，请稍后再试！'}};
    // 投注记录、统计检查
    const _time = dayjs().format('YYYY-MM-DD');
    await UserBetDataCheck({
        user_id: id,
        category,
        type,
        time: _time
    });
    await UserDaySumCheck({
        user_id: id,
        time: _time
    });
    // 是否已投注
    const _user_bet = await USERBET.findOne({
        attributes: ['id','dou','vals','ls', 'telegram_chat'], 
        where:{ 
            user_id: id,
            category,
            type,
            peroids,
            status: 1
        }
    });
    // 是否已投注 0是 1否
    let _is_bet_ed = _user_bet ? 0 : 1;
    // 流水检查 1是 2否
    // let _is_ls = 1;
    //
    let { _is_ls, _new_num, _new_vals, _new_dou, _ls_dou } = await lsre({ 
        category, 
        type, 
        _post_vals: {...vals}, 
        _old_vals: _user_bet&&_user_bet.vals || '{}', 
        _old_dou: _user_bet&&_user_bet.dou || 0,
        _old_ls: _user_bet&&_user_bet.ls || 1
    });
    //
    _new_dou = Math.ceil(_new_dou / 1000) * 1000;
    _ls_dou = Math.ceil(_ls_dou / 1000) * 1000;
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
        let user_old_dou = parseInt(_user_data.dou);
        if(user_old_dou<dou) throw new Error(101);
        //
        let user_new_dou = user_old_dou - dou;        
        if(_user_bet)
        {
            const new_chat = JSON.parse(telegram_chat);
            const old_chat = JSON.parse(_user_bet.telegram_chat);
            const newTelegramChat = {
                chat_type: [...old_chat.chat_type, ...new_chat.chat_type],
                text:  old_chat.text + ',' + new_chat.text,
                first_name: old_chat.first_name ,
                telegram_id: old_chat.telegram_id
            }
            // 
            await USERBET.update({
                num: _new_num,
                dou: _new_dou,
                vals: JSON.stringify(_new_vals),
                ls: _is_ls,
                telegram_chat: JSON.stringify(newTelegramChat),
                time
            },{ 
                where:{
                    id: _user_bet.id
                }
            }, { transaction });
        }else{
            await USERBET.create({ 
                user_id: id,
                category,
                type,
                peroids,
                num,
                dou,
                vals: JSON.stringify(vals),
                telegram_chat,
                status: 1,
                ls: _is_ls,
                time
            }, { transaction });
        }
        // 更新用户金额
        await USERDATA.update({ dou: user_new_dou }, { where:{
            [Op.and]: [
                { user_id: id }, 
                { dou: {[Op.gte]: 0} }
            ],
        }, transaction });
        // 金豆日志
        await USERLOGDOU.create({
            user_id: id,
            type: 3,
            mode: 1,
            num: dou,
            dou: user_new_dou,
            des: await GameName(category,type)+',period: '+peroids+', numbers: '+num,
            time
        }, { transaction });
        // 
        // 更新投注情况
        await sequelize.query(
            'UPDATE `user_bet_data` SET '+
            '`bet`=`bet` + '+dou+', '+
            '`pn`=`pn` + '+_is_bet_ed+' '+
            'WHERE user_id='+id+' and category="'+category+'" and type="'+type+'" and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_day_data` SET '+
            '`bet`=`bet` + '+dou+', '+
            '`ls`=`ls` + '+_ls_dou+', '+
            '`cls`=`cls` + '+_ls_dou+' '+
            'WHERE user_id='+id+' and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_sum` SET '+
            '`bet`=`bet` + '+dou+', '+
            '`ls`=`ls` + '+_ls_dou+' '+
            'WHERE user_id='+id, 
            { transaction }
        );
        // 推广返利
        if(_is_ls==1 && _user.parent)
        {
            await tgBetAdd({
                user_id: _user.parent,
                dou,
                time,
                transaction
            });
        }
        //
        return {
            user_new_dou,
            _is_bet_ed
        }
    });
    // 
    if(!_re) return '投注失败，请稍后再试！';
    if(_re==101) return '余额不足，请联系 @jlfcqb_bot 充值！';
    //
    let _is_qun = ['q214','q28'].find(v=>v==category);
    if(!_is_qun)
    {
        // 更新四期投注情况
        await fouChange(category, type, peroids, dou, _re._is_bet_ed, _new_dou);
    }
    //
    await redis_2_pubs('sd28-admin-data', JSON.stringify({GameBet:[
        dayjs().format('MM-DD HH:mm:ss'),
        mode,
        id,
        _user.nick,
        category+'/'+type,
        peroids,
        vals,
        dou,
    ]}));
    // 
    await redis_2_pubs('sd28-admin-data', JSON.stringify({ HomeSum:{user_bets:dou} }));
    // 
    const { text } = JSON.parse(telegram_chat);
    // 
    return nick + '【'+ telegram_id +'】' + '\n\n' + 
    '期号：' + peroids + '\n\n' +
    '下注内容' + '\n' +
    '------------' + '\n' +
    text + '\n' +
    '------------' + '\n' +
    '余额：' + nTom(_re.user_new_dou) + '\n\n' +

    "提示:" + '\n' +
    '查看结果 => 发 "jg" 或者 "结果"' + '\n' +
    '查看预测 => 发 "yc" 或者 "预测"' + '\n' +
    '查看走势图 => 发 "zst" 或者 "走势图"';
}
// 
module.exports = {
    bet
}