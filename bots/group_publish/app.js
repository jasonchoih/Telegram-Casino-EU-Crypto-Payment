const { Telegraf, Input } = require('telegraf');
const fs = require('fs');
const path = require('path');
// 
const { redis_2_sub, get_2, async_get_telegram, async_get_auto_bot, async_set_auto_bot, get_1 } = require('./plugin/redis'); 
const { gameInfo, getBots, maskNumber, nTom, getBotsResult, getJgText } = require('./service/bet');
const { USERBET, Op } = require('./sequelize/db28');
const { generateScreenshot, generateSingle } = require('./service/puppy');
// 
redis_2_sub.subscribe('sd28-site-room');
const startPub = async() => 
{
    const games = {};
    const gameNames = await async_get_telegram('myGameBots');
    // 
    for(let i in gameNames){
        const v = gameNames[i];
        games[i] = {
            bot: new Telegraf(v.bot),
            group_chat_id: v.group_chat_id
        }
    }
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
    for(let CATEGORY_GROUP in games) 
    {
        const { bot, group_chat_id } = games[CATEGORY_GROUP];
        //   
        redis_2_sub.on("message", async(channel, message) =>
        {
            const { controller, game, data, category, peroids } = JSON.parse(message);
            // 
            // Open for Betting
            if(controller=='game_lottery_open'&&category==_lotterys[CATEGORY_GROUP])
            {
                const sysbetmax = await get_2('sysbetmax');
                const sysbetmax_xg = parseInt(sysbetmax[CATEGORY_GROUP+'-xg']) || 50000000; 
                const sysbetmax_wh = sysbetmax[CATEGORY_GROUP+'-wh'] || 1;
                const gameset = await get_2('GameSet');
                const type = CATEGORY_GROUP=='pk' ? 'sc' : 28;
                // 
                const gameInformation = gameInfo[CATEGORY_GROUP];
                const rule28 = '下注格式为：单+金额 例 <b>单100</b>'  + '\n' +
                    'PC28选择：单 双 大 小 中 边 大单 小单 大双 小双 大边 小边' + '\n' +
                    '押单数格式为：金额+押+数字 例 <b>100押3</b>'  + '\n' +
                    '押豹子：豹子+金额 例 <b>豹子100</b>' + '\n' +
                    '选择：豹子 顺子 对子 半子 杂子';
                // 
                const rulepk = '车道1倒10选择：单 双 大 小 龙 虎' + '\n' +
                    '下注格式为：例<b>车道1 小100</b>'  + '\n' +
                    '押单数格式为：金额+押+数字：例 <b>车道1 1押100, 2押300</b>'  + '\n\n' +
                    '押冠亚和：冠亚和+金额 例 <b>冠亚和 11押300</b>' + '\n' +
                    '冠亚和选择：单 双 大 小 例 <b>冠亚和 小100</b>';
                // 
                const broadcast = "" +
                    "🔥" + gameInformation[0] + '，第 '+(peroids+1)+' 期，开始下注！🔥' + '\n\n' +
                    (CATEGORY_GROUP=='pk' ? rulepk : rule28 ) + '\n\n' +
                    // 
                    '✦——————————————✦' + '\n\n' +
                    // official web
                    '如有任何需要协助、问题或疑问，请随时联系我们的客户服务团队，电话是 @jlfc_kf' + '\n' +
                    '如需查询个人信息或充值钱包，请联系 @jlfcqb_bot。' + '\n' +
                    '新玩法增加私聊机器人下注，保护您的隐私，点击机器人下注  @jlfc_' + CATEGORY_GROUP + '_bot' + '\n\n' +
                    // 
                    '✅免责条款：金狼福财'  + '\n' +
                    '🔺请添加客服为好友备注好以免被骗 @jlfc_kf'  + '\n\n' +
            
                    '✦——————————————✦'  + '\n\n' +
                    
                    gameInformation[2]  + '\n\n' +
            
                    // '官方网站: ' +  gameInformation[1] + '\n' +
            
                    '✦——————————————✦'  + '\n\n' +
            
                    '最低投注：' + nTom(gameset['min-bet']||1000) + '金豆' + '\n' +
                    '最高投注：' + nTom(sysbetmax_xg) + '金豆' +'\n' +
                    '最高中奖：' + nTom(gameset['max-open']||10000000000) + '金豆' + '\n\n' +
            
                    '✦——————————————✦'  + '\n\n' +
                    
                    '🈲🈲私信发地址的都是骗子' + '\n' +
                    '🈲🈲私信发地址的都是骗子' + '\n' +
                    '🈲🈲私信发地址的都是骗子' + '\n\n' +
            
                    '✦——————————————✦'  + '\n\n' +

                    '㊗️老板们：旗开得胜，荷包满满！🧧🧧🧧' + '\n' +
                    '关注我们的频道以获取更多信息和奖金奖励 🏆🏆🏆' + '\n' +
            
                    "感谢您的信任和支持。我们将继续发行更多奖励，如VIP会员级别，以回报您的持续支持。在您的娱乐市场上，我们是最正宗、最专业的选择。";
                //
                if(sysbetmax_wh==1) // MAINTAINENCE MODE
                {
                    bot.telegram.sendMessage(group_chat_id, broadcast, { parse_mode: 'HTML' });
                    const s = await generateSingle({ category: CATEGORY_GROUP, peroids: peroids, path:'jg', type });
                    if(s) {
                        const a = await bot.telegram.sendPhoto(group_chat_id, Input.fromLocalFile("./screens/"+CATEGORY_GROUP+"/jg_"+peroids+".png"));
                        // 
                        const bet_win = await USERBET.findAll({
                            attributes: ['time', 'dou', 'telegram_chat'],
                            where:{ 
                                status: 2, 
                                category: CATEGORY_GROUP, 
                                peroids, 
                                type: { [Op.in]: CATEGORY_GROUP=='pk' ? ['sc']: [28, 36] }
                            },
                            order: [['time']]
                        });
                        //  BET OUT
                        const bots = await async_get_auto_bot(CATEGORY_GROUP+'_latest_bet_bots')
                        const lottery = await get_1('lottery_last_'+_lotterys[CATEGORY_GROUP])
                        // 
                        const numbers =  lottery[CATEGORY_GROUP][type];
                        const tumber = type=='sc' ? lottery[CATEGORY_GROUP][type] : lottery[CATEGORY_GROUP]['qun'];
                        const bots_winner = await getBotsResult({
                            category: CATEGORY_GROUP, 
                            peroids: lottery.peroids, 
                            lottery,
                            type,
                            bots
                        })
                        // 
                        let bet_win_result= peroids + "期开奖结果" + '\n'; // WINNERS
                        numbers[0].map((v,k)=>( k<numbers[0].length-1 ? bet_win_result+=v+'+' : bet_win_result+=v+'='));
                        type=='sc' ? (tumber[1].slice(0,3)).map((v,k)=>bet_win_result+=getJgText(v)) : numbers[0][1] + (tumber.slice(0,4).map((v)=>bet_win_result+=getJgText(v) ));
                        bet_win_result+= '\n\n';
                        // 
                        if(bet_win.length>0 || bots_winner.length>0) bet_win_result+='---本期中奖玩家---\n';
                        for(let i in bet_win){
                            const v = bet_win[i];
                            const { first_name, telegram_id, text, chat_type } = JSON.parse(v.telegram_chat);
                            // bet_win_result += (chat_type=='private'? '*'.repeat(first_name.length) : first_name) + ' ' + '【' + (chat_type=='private'?maskNumber(telegram_id):telegram_id) + '】' + text + '\n';
                            bet_win_result += first_name + ' ' + '【' + (chat_type=='private'?maskNumber(telegram_id):telegram_id) + '】' + text + '\n';
                        }
                        // 
                        bet_win_result += bots_winner;
                        // 
                        if(a) await bot.telegram.sendMessage(group_chat_id, bet_win_result, {
                            reply_to_message_id: a.message_id,
                            parse_mode: 'HTML'
                        });
                    }
                    // 
                    await generateScreenshot({ category:CATEGORY_GROUP, peroids: peroids, type });
                    // 
                    const filesToKeep = [
                        "jg_"+peroids+".png",
                        "yc_"+peroids+".png",
                        "zst_"+peroids+".png"
                    ];
                    // 
                    fs.readdir(__dirname+'/screens/'+CATEGORY_GROUP, (err, files) => 
                    {
                        if (err) return;
                        // 
                        (async () => {
                        for (const file of files) {
                            if (!filesToKeep.includes(file)) {
                            try {
                                await fs.promises.unlink(path.join(__dirname+'/screens/'+CATEGORY_GROUP, file));
                            } catch (unlinkErr) {
                                // console.log(unlinkErr)
                            }
                            }
                        }
                        })();
                    });
                }
            }
            // Stop & wait betting
            if(controller=='game_qun_auto_bet_show'&&game==('q28'+CATEGORY_GROUP)&&data[0]==2&&data[4]=='wait') 
            {
                const sysbetmax = await get_2('sysbetmax');
                const sysbetmax_wh = sysbetmax[CATEGORY_GROUP+'-wh'] || 1;
                // 
                const _bet_list = await USERBET.findAll({
                    attributes: ['time', 'dou', 'telegram_chat'],
                    where:{ 
                        status: 1, 
                        category: CATEGORY_GROUP, 
                        peroids: data[3], 
                        type: { [Op.in]: CATEGORY_GROUP=='pk' ? ['sc'] : [28, 36] }
                    },
                    order: [['time']]
                });
                // Bet IN
                const bots = await getBots(CATEGORY_GROUP);
                await async_set_auto_bot(CATEGORY_GROUP+'_latest_bet_bots', bots)
                // 
                let bet_result= "";
                if(_bet_list.length>0 || bots.length>0 ) bet_result='-----本期下注玩家-----\n';
                for(let i in _bet_list)
                {
                    const v = _bet_list[i];
                    const { text, chat_type, first_name, telegram_id } = JSON.parse(v.telegram_chat);
                        bet_result += first_name + ' ' + '【' + (chat_type[chat_type.length-1]=='private'?maskNumber(telegram_id):telegram_id) + '】' + text + '\n';
                        // bet_result += (chat_type[chat_type.length-1]=='private'? '*'.repeat(first_name.length) : first_name) + ' ' + '【' + (chat_type[chat_type.length-1]=='private'?maskNumber(telegram_id):telegram_id) + '】' + text + '\n';
                }
                // 
                for(let i in bots){
                    const v = bots[i]
                    bet_result += v.name + "【" + v.telegram_id + "】" + v.amount + '\n'
                }
                // 
                const broadcast = "" + bet_result ? data[2] + '\n\n' + bet_result : data[2];
                // 
                if(sysbetmax_wh==1) bot.telegram.sendMessage(group_chat_id, broadcast, { parse_mode: 'HTML' });
            }
        });
    }
}
// 
try {
    startPub();
} catch (error) {
    // console.log(error)
}
