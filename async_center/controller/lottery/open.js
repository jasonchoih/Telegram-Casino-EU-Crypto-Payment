const dayjs = require('dayjs');
// 
const { sequelize,Op, USERS, USERDATA, USERBET, USERLOGDOU, USERBETAUTO, USERTELEGRAM } = require('../../sequelize/db28');
const { admin_to_user, redis_2_pubs, async_get_telegram, get_3, get_1 } = require('../../tool/redis');
const { nTom,GameName,percent } = require('../../tool/tool');
const { getGameBetData, UserBetDataCheck, UserDaySumCheck } = require('../../service/usersum');
const { TCL } = require('../../service/transaction');
const { getJgText } = require('../../tool/tool')
// 
const { Telegraf } = require('telegraf');
// 赢了
const win = async(d) => 
{
    let { id, user_id, category, type, peroids, vals, wins, win_dou, mode, _bet_dou, _bet_time, time } = d;
    // console.log(d)
    // 
    const _user = await USERS.findOne({attributes:['id','uuid','nick'],where:{id:user_id}});
    if(!_user) return;
    // 
    // 投注记录、统计检查
    const _time = dayjs(_bet_time).format('YYYY-MM-DD');
    // 
    let _re = await TCL(async(transaction)=>
    {
        const _user_data = await USERDATA.findOne({
            attributes: ['dou'], 
            where:{ 
                user_id
            }
        }, { transaction });
        // 
        if(!_user_data) throw new Error(101);
        //
        const user_new_dou = parseInt(parseInt(_user_data.dou)+parseInt(win_dou));
        // 更新投注
        await USERBET.update({
            wins: JSON.stringify(wins),
            win_dou,
            status: 2
        },{ 
            where:{ id, status:1 }
        }, { transaction });
        // 更新用户金额
        await USERDATA.update({ dou: user_new_dou }, { where:{
            user_id, 
            dou: {[Op.gte]: 0}
        }, transaction });
        // 金豆日志
        await USERLOGDOU.create({
            user_id,
            type: 4,
            mode: 2,
            num: win_dou,
            dou: user_new_dou,
            des: await GameName(category,type)+',第 '+peroids+' 期,中奖 '+nTom(win_dou)+' 豆',
            time
        }, { transaction });
        // 更新统计
        const _win = parseInt(parseInt(win_dou)-parseInt(_bet_dou));
        await sequelize.query(
            'UPDATE `user_bet_data` SET '+
            '`win_dou`=`win_dou` + '+win_dou+', '+
            '`win`=`win` + '+_win+', '+
            '`wn`=`wn` + 1 '+
            'WHERE user_id='+user_id+' and category="'+category+'" and type="'+type+'" and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_day_data` SET '+
            '`win_dou`=`win_dou` + '+win_dou+', '+
            '`win`=`win` + '+_win+' '+
            'WHERE user_id='+user_id+' and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_sum` SET '+
            '`win_dou`=`win_dou` + '+win_dou+', '+
            '`win`=`win` + '+_win+' '+
            'WHERE user_id='+user_id, 
            { transaction }
        );
        // 更新自动投注 - 中奖
        // if(mode==2)
        // {
        //     const _user_bet_auto = await USERBETAUTO.findOne({ 
        //         attributes: ['id','win'], 
        //         where:{
        //             user_id,
        //             category,
        //             type, 
        //             status: 2,
        //         } 
        //     }, { transaction });
        //     if(_user_bet_auto)
        //     {
        //         let win = _user_bet_auto.win || 0;
        //         const _win_dou = parseInt(parseInt(win_dou)-parseInt(_bet_dou));
        //         win = parseInt(parseInt(win)+parseInt(_win_dou));
        //         await USERBETAUTO.update({
        //             win
        //         },{
        //             where:{ id: _user_bet_auto.id }
        //         }, { transaction });
        //     }
        // }
        // 
        return {
            user_new_dou
        };
    });
    // 
    if(!_re || _re==100) return;
    // 
    await redis_2_pubs('sd28-admin-data', JSON.stringify({OpenLottery:[
        mode,
        dayjs().format('MM-DD HH:mm:ss'),
        _user.id,
        _user.nick,
        category+'/'+type,
        peroids,
        Object.keys(JSON.parse(vals)).length,
        _bet_dou,
        win_dou,
        wins
    ]}));
    // ====
    await redis_2_pubs('sd28-admin-data', JSON.stringify({HomeSum:{
        user_wins: win_dou - _bet_dou
    }}));
    // 
    const _lotterys = {
        jnd: 'jnd',
        pk: 'jnd',
        dd: 'ddbj',
        bj: 'ddbj',
        jnc: 'jnc',
        elg: 'elg',
        slfk: 'slfk',
        btc: 'btc',
        au: 'au',
        kr: 'kr'
    };
    try {
        const { telegram_id, telegram_bet_acl } = await USERTELEGRAM.findOne({attributes:['telegram_id', 'telegram_bet_acl'],where:{user_id}})
        const { telegram_chat } = await USERBET.findOne({attributes:['telegram_chat'],where:{peroids, user_id, type}});
        const _text = JSON.parse(telegram_chat).text;
        // 
        const lottery = await get_1('lottery_last_'+_lotterys[category])
        const numbers = lottery[category][type];
        const tumber = category=='pk' ? lottery[category][type] : lottery[category]['qun'];
        const scgyh = type=='sc' ? tumber[0][0] + '+' + tumber[0][1] + '=' + tumber[1][0] + getJgText(tumber[1][1])  + getJgText(tumber[1][2]) : tumber[0][0] + '+' + tumber[0][1] + '=' + tumber[1]
        let jgs = category=='pk' ? scgyh +'\n\n' : 
        numbers[0][0] + '+'  + numbers[0][1] + '+'  + numbers[0][2]+ '=' + tumber[0] + ' ' + getJgText(tumber[1])+ '' + getJgText(tumber[2]) + ' ' + getJgText(tumber[3]) + '\n\n' ;
        // 
        const _vals = {}
        const _vals_i = JSON.parse(vals);
        // 
        for(let i in _vals_i)
        {
            let _vi = _vals_i[i];
            if(wins[i])
            {
                _vals[i] = [
                    _vi,
                    ...wins[i]
                ];
            }
        }
        // 
        let pelu = ''
        Object.keys(_vals).map(k=>(
            pelu+= '\n' + getJgText(k) + '：' + _vals[k][0] + ' x ' +_vals[k][1] + ' = ' + nTom(_vals[k][2]) + '金豆'
        ))
        // 
        const text = '🎉 老板恭喜您，中奖了 666！ 💓💓'  + '\n\n' +
        await GameName(category,type)+',第 '+peroids+' 期' + '\n' +
        '开奖结果：' + jgs +
    
        '下注：' + _text + '\n' +
        '共' + Object.keys(JSON.parse(vals)).length + '注，合计' + nTom(_bet_dou) + '豆' + 
        pelu + '\n\n' +
        
        '中奖：'+ nTom(win_dou)+' 金豆'+ '\n' +
        '盈亏：' + nTom(win_dou - _bet_dou) +' 金豆'+ '\n' +
        '余额：' + nTom(_re.user_new_dou) +' 金豆' + "\n\n" +
    
    
        "提示:" + '\n' +
        '查看结果 => 发 "jg" 或者 "结果"' + '\n' +
        '查看预测 => 发 "yc" 或者 "预测"' + '\n' +
        '查看走势图 => 发 "zst" 或者 "走势图"';
        // 
        const bots = {};
        const gameNames = await async_get_telegram('myGameBots');
        // 
        for(let i in gameNames){
            const v = gameNames[i];
            bots[i] = {
                bot: new Telegraf(v.bot),
                group_chat_id: v.group_chat_id
            }
        }
        // 
        const { bot } = bots[category];
        if(!telegram_bet_acl) return;
        const tba = JSON.parse(telegram_bet_acl);
        for(let i in tba){
            const v = tba[i];
            if(gameNames[category]['bot'] == v.tok) {
                bot.telegram.sendMessage(telegram_id, text, {parse_mode: 'HTML'});
                return;
            }
        }
    } catch (error) {
        // console.log(error)
    }
}
// 输了
const lose = async(d) => 
{
    let { id, user_id, category, type, peroids, dou, mode, _bet_time } = d;
    //
    dou = parseInt(dou);
    // 
    const _user = await USERS.findOne({attributes:['id','uuid'],where:{id:user_id}});
    if(!_user) return;
    // 
    // 投注记录、统计检查
    const _time = dayjs(_bet_time).format('YYYY-MM-DD');
    await UserBetDataCheck({
        user_id,
        category,
        type,
        time: _time
    });
    await UserDaySumCheck({
        user_id: user_id,
        time: _time
    });
    // 
    let _re = await TCL(async(transaction)=>
    {
        // 更新投注
        await USERBET.update({
            status: 3
        },{ 
            where:{ id, status:1 }
        }, { transaction });
        // 更新统计
        await sequelize.query(
            'UPDATE `user_bet_data` SET '+
            '`win`=`win` - '+dou+' '+
            'WHERE user_id='+user_id+' and category="'+category+'" and type="'+type+'" and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_day_data` SET '+
            '`win`=`win` - '+dou+' '+
            'WHERE user_id='+user_id+' and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_sum` SET '+
            '`win`=`win` - '+dou+' '+
            'WHERE user_id='+user_id, 
            { transaction }
        );
        // 更新自动投注 - 输了
        // if(mode==2)
        // {
        //     const _user_bet_auto = await USERBETAUTO.findOne({ 
        //         attributes: ['id','win'], 
        //         where:{
        //             user_id,
        //             category,
        //             type, 
        //             status: 2,
        //         } 
        //     }, { transaction });
        //     if(_user_bet_auto)
        //     {
        //         let win = _user_bet_auto.win || 0;
        //         win = parseInt(parseInt(win)-parseInt(dou));
        //         await USERBETAUTO.update({
        //             win
        //         },{
        //             where:{ id: _user_bet_auto.id }
        //         }, { transaction });
        //     }
        // }
        return 'ok';
    });
    // 
    if(!_re) return;
    // 
    await redis_2_pubs('sd28-admin-data', JSON.stringify({HomeSum:{
        user_wins: -dou
    }}));
    // 
    const _lotterys = {
        jnd: 'jnd',
        pk: 'jnd',
        dd: 'ddbj',
        bj: 'ddbj',
        jnc: 'jnc',
        elg: 'elg',
        slfk: 'slfk',
        btc: 'btc',
        au: 'au',
        kr: 'kr'
    };
    // 
    try {
        const ud = await USERDATA.findOne({attributes:['dou'],where:{user_id}});
        // 
        const { telegram_id, telegram_bet_acl } = await USERTELEGRAM.findOne({attributes:['telegram_id', 'telegram_bet_acl'],where:{user_id}})
        const { telegram_chat } = await USERBET.findOne({attributes:['telegram_chat'],where:{peroids, user_id, type}});
        const _text = JSON.parse(telegram_chat).text;
        // 
        const lottery = await get_1('lottery_last_'+_lotterys[category])
        const numbers =  lottery[category][type];
        const tumber =  category=='pk' ? lottery[category][type] : lottery[category]['qun'];
        // 
        const scgyh = type=='sc' ? tumber[0][0] + '+' + tumber[0][1] + '=' + tumber[1][0] + getJgText(tumber[1][1])  + getJgText(tumber[1][2]) : tumber[0][0] + '+' + tumber[0][1] + '=' + tumber[1]
        let jgs = category=='pk' ? scgyh +'\n\n' : 
        numbers[0][0] + '+'  + numbers[0][1] + '+'  + numbers[0][2]+ '=' + tumber[0] + ' ' + getJgText(tumber[1])+ '' + getJgText(tumber[2]) + ' ' + getJgText(tumber[3]) + '\n\n' ;
        // 
        const text = '老板未中奖，请不要气馁 祝您在下一次好运 加油！！💓💓' + '\n\n' +
        await GameName(category, type)+',第 '+peroids+' 期' + '\n' +
        '下注：' + _text + '\n' +
        '开奖结果：' +  jgs +
        '中奖：'+ nTom(0)+' 金豆'+ '\n' +
        '盈亏：' + nTom(-dou) +' 金豆'+ '\n' + 
        '余额：' + nTom(ud.dou) +' 金豆'+ '\n\n' + 
    
        "提示:" + '\n' +
        '查看结果 => 发 "jg" 或者 "结果"' + '\n' +
        '查看预测 => 发 "yc" 或者 "预测"' + '\n' +
        '查看走势图 => 发 "zst" 或者 "走势图"';
        // 
        const bots = {};
        const gameNames = await async_get_telegram('myGameBots');
        // 
        for(let i in gameNames){
            const v = gameNames[i];
            bots[i] = {
                bot: new Telegraf(v.bot),
                group_chat_id: v.group_chat_id
            }
        }
        // 
        const { bot } = bots[category];
        if(!telegram_bet_acl) return;
        // 
        const tba = JSON.parse(telegram_bet_acl);
        for(let i in tba){
            const v = tba[i];
            if(gameNames[category]['bot'] == v.tok) {
                bot.telegram.sendMessage(telegram_id, text, {parse_mode: 'HTML'});
                return;
            }
        }
       
    } catch (error) {
        // console.log(error)
    }
}
// 
module.exports = {
    win,
    lose
}