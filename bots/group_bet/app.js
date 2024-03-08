require('dotenv').config();
const fs = require('fs');
const { Telegraf } = require('telegraf');
const controllers = require('./plugin/controllers');
const controller = controllers('../controller');
// 
const SEND = async(path, data) => {
  const _path = path.split('/');
  return await controller[_path[0]][_path[1]](data);
}
// 
const { checkForSpecificKeys, get_1_List_fou_new } = require('./service/bet');
const { checkForSpecificPK  } = require('./service/betpksc');
const { get_2, async_set_telegram, async_get_telegram, redis_1_lottery_fou } = require('./plugin/redis'); 
const { USERS, USERTELEGRAM } = require('./sequelize/db28');
const { generateSingle } = require('./service/puppy');
// 
const screens = {
    'jg' : /(Jg|jg|jieguo|Jieguo|结果|开奖结果)/, 
    'yc' : /(Yc|yc|yuce|Yuce|预测|开奖预测)/, 
    'zst' : /(Zs|zs|Zst|zst|走势图)/
}
// 
const actions = [
    'check_dou',
    'check_ls',
    'check_jl',
    'check_dh'
]
// 
const keyboard = [
    [
        { "text": "查看余额", "callback_data": 'check_dou' }, 
        { "text": "投注记录", "callback_data": "check_jl" }
    ],
    [
        { "text": "查看流水", "callback_data": 'check_ls' }, 
        { "text": "查看提现费", "callback_data": 'check_dh' }, 
    ],
    [
        { "text": "💰 充值/提现", "url": "https://t.me/jlfcqb_bot" }
    ],
    [
        { "text": "🤵🏻‍♀️ 联系客服", "url": "https://t.me/jlfc_kf" }
    ]
]
// 
const updateKeyboard = async() =>{ await async_set_telegram('betKeyboard', keyboard)}
updateKeyboard();
// 
const startBet = async() => 
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
        const { bot } = games[CATEGORY_GROUP];
        const type = CATEGORY_GROUP=='pk' ? 'sc' : 28;
        bot.start(async(ctx)=>
        {
            const telegram_id = ctx.update.message.from.id;
            const bot_id = ctx.botInfo.id;
            const bot_username = ctx.botInfo.username;
            const tok = ctx.telegram.token;
            // 
            const _tba = await USERTELEGRAM.findOne({attributes:['telegram_bet_acl', 'user_id'], where:{telegram_id},raw: true});
            // 
            if(!_tba.user_id) return;
            // 
            if(!_tba.telegram_bet_acl)
            {
                await USERTELEGRAM.update({
                    telegram_bet_acl: JSON.stringify([{ bot_username: bot_username, bot_id: bot_id, tok: tok }])
                }, {
                    where: {telegram_id}
                })
            }else{
                const tba = JSON.parse(_tba.telegram_bet_acl)
                for(let i in tba){
                    const v = tba[i]
                    if(bot_id == v.bot_id) return;
                }
                const newACL = [ ...tba, { bot_username: bot_username, bot_id: bot_id, tok:tok }]
                await USERTELEGRAM.update({ telegram_bet_acl: JSON.stringify(newACL)}, 
                { where: {telegram_id}})
            }
            // 
            await ctx.replyWithHTML('老板好，非常欢迎您！我将是您的个人助理，为您提供最专业的服务。在这里，我会为您保密地宣布开奖结果，并且您也可以向我分享您个人的下注。' +  '\n' + 
            '查看结果（jg），预测（yc），走势图（zst）' + '\n' +
            "如果您有任何问题或需要，随时联系在线客服 @jlfc_kf。" + '\n\n' +
            
            '祝您好运❤️ ！')
        })
        // 
        for(let path in screens)
        {
            bot.hears(screens[path], async(ctx) => 
            {
                const _p = await get_1_List_fou_new(_lotterys[CATEGORY_GROUP]);
                const peroids = _p.peroids - 1;
                // 
                if (fs.existsSync(`/telegram/bots/group_publish/screens/${CATEGORY_GROUP}/${path}_${peroids}.png`)) {
                    await ctx.replyWithPhoto({ source:"/telegram/bots/group_publish/screens/"+CATEGORY_GROUP+"/"+path+"_"+peroids+".png"}, {
                        reply_to_message_id: ctx.update.message.message_id
                    })
                } 
                else{
                    await generateSingle({ category: CATEGORY_GROUP, peroids, path, type }).then(async()=>{
                        await ctx.replyWithPhoto({ source:"/telegram/bots/group_publish/screens/"+CATEGORY_GROUP+"/"+path+"_"+peroids+".png"}, {
                            reply_to_message_id: ctx.update.message.message_id
                        })
                    })
                    
                }
            })
            bot.hears(/(YUE|Yue|yue|余额)/, async(ctx) => 
            {
                const { id } = ctx.from;
                // 
                const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'],where:{telegram_id:id}})
                const _user = await USERS.findOne({attributes:['role','status'],where:{id:user_id}});
                if(_user.status!='1'|| _user.role!='1') return;
                // 
                const re = await SEND('user/check_dou',{
                    telegram_id: id
                })
                if(re){
                    await ctx.replyWithHTML(re, {
                        reply_to_message_id: ctx.update.message.message_id 
                    });
                }
            })
        } 
        // 
        bot.on('text', async(ctx) => 
        {
            const sysbetmax = await get_2('sysbetmax');
            const sysbetmax_wh = sysbetmax[CATEGORY_GROUP+'-wh'] || 1;
            // 
            const { text, message_id, chat } = ctx.message;
            const { id, first_name } = ctx.message.from;
            // 
            const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'],where:{telegram_id:id}})
            if(user_id)
            {
                const { role, status, nick, cs } = await USERS.findOne({attributes:['role','status', 'nick', 'cs'],where:{id:user_id}});
                if(status!='1'|| role!='1' || cs!=1) return;
                // 
                if(CATEGORY_GROUP=='pk')
                {
                    const { vals, type } = await checkForSpecificPK(text);   
                    if(Object.keys(vals).length>0 && sysbetmax_wh==2)
                    {
                        return await ctx.reply('游戏维护中，请稍后再进行投注，谢谢配合！', { 
                            reply_to_message_id: message_id 
                        })
                    }
                    const { peroids } = await get_1_List_fou_new(_lotterys[CATEGORY_GROUP]);
                    if(Object.keys(vals).length>0 && sysbetmax_wh==1)
                    {
                        const bet = await SEND('game/bet', {
                            game: CATEGORY_GROUP+type,
                            category: CATEGORY_GROUP,
                            type,
                            peroids,
                            vals,
                            id: user_id,
                            message_id,
                            nick,
                            telegram_id:id,
                            telegram_chat: JSON.stringify({
                                text,
                                chat_type: [chat.type],
                                first_name: nick,
                                telegram_id: id
                            })
                        })
                        if(bet) ctx.reply(bet, { reply_to_message_id: message_id });
                    }
                }else{
                    const { vals, type } = await checkForSpecificKeys(text);       
                    if(Object.keys(vals).length>0 && sysbetmax_wh==2)
                    {
                        return await ctx.reply('游戏维护中，请稍后再进行投注，谢谢配合！', { 
                            reply_to_message_id: message_id 
                        })
                    }
                    // 
                    const { peroids } = await get_1_List_fou_new(_lotterys[CATEGORY_GROUP]);
                    if(Object.keys(vals).length>0 && sysbetmax_wh==1)
                    {
                        const bet = await SEND('game/bet', {
                            game: CATEGORY_GROUP+type,
                            category: CATEGORY_GROUP,
                            type,
                            peroids,
                            vals,
                            id: user_id,
                            message_id,
                            nick,
                            telegram_id:id,
                            telegram_chat: JSON.stringify({
                                text,
                                chat_type: [chat.type],
                                first_name: nick,
                                telegram_id: id
                            })
                        })
                        if(bet) ctx.reply(bet, { reply_to_message_id: message_id });
                    }
                }
                
            }
        });
        // 
        for(let i in actions)
        {
            const action = actions[i];
            // 
            bot.action(action, async(ctx) => 
            {
                const { id } = ctx.from;
                // 
                const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'],where:{telegram_id:id}})
                const _user = await USERS.findOne({attributes:['role','status'],where:{id:user_id}});
                if(_user.status!='1'|| _user.role!='1') return;
                // 
                const re = await SEND('user/'+action,{
                    telegram_id: id,
                    category: CATEGORY_GROUP
                })
                if(re){
                    await ctx.answerCbQuery(re, {
                        show_alert: true
                    });
                }
            })
        }
        // 
        // bot.on("new_chat_members", async (ctx) => 
        // {
        //     console.log(ctx);
        //     console.log('from', ctx.update.message.from)
        //     console.log('chat', ctx.update.message.chat)
        //     console.log('ncp', ctx.update.message.new_chat_participant)
        //     console.log('nc', ctx.update.message.new_chat_member)
        //     console.log('ncs', ctx.update.message.new_chat_members)
        //   })
        // 
        bot.launch();
        bot.catch((err) => {
            // console.log('Ooops', err)
        })
    }
    // 
    process.once('SIGINT', () =>  
    {
        for(let CATEGORY_GROUP in games) 
        {
            const { bot } = games[CATEGORY_GROUP];
            bot.stop('SIGINT')
        }
        
    })
    process.once('SIGTERM', () => 
    {
        for(let CATEGORY_GROUP in games) 
        {
            const { bot } = games[CATEGORY_GROUP];
            bot.stop('SIGINT')
        }
    })

}
// 
startBet()