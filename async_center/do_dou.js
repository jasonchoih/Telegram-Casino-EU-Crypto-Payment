const dayjs = require('dayjs');
const controllers = require('./tool/controllers');
const controller = controllers('../controller');
const { redis_2_pub, redis_2_ltrim, async_get_telegram } = require('./tool/redis');
const { Telegraf } = require('telegraf');
// 
// console.log(controller);
//
const { redis_2_brpop } = require('./tool/redis');
//
const _platform_publish_name = {
    admin: 'sd28-admin-room', // _user_id_uuid
    user: 'sd28-user-room', // uuidkey
    agent: 'sd28-user-room', // uuidkey
    lottery: 'sd28-admin-to-user-room', // _user_id_uuid
}
// 
const dataChange = async(d) => 
{
    const bots = {};
    const walletKey = await async_get_telegram('myWalletBot');
    const wallet = new Telegraf(walletKey.wallet);
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
    try {
        let _d = JSON.parse(d);
        let { path, platform } = _d;
        let { uuidkey, telegram_id, message_id, telegram_chat, category } = _d.data;
        _d.data.time = dayjs().format('YYYY-MM-DD HH:mm:ss');
        // 
        const data = await controller[platform][path[0]][path[1]](_d.data);
        if(!data) return;
        // 
        redis_2_pub.publish(_platform_publish_name[platform], JSON.stringify({
            uuidkey,
            data
        }));
        // 
        if(platform=='user'&&path[0]=='game'&&path[1]=='bet') 
        {
            const { chat_type } = JSON.parse(telegram_chat);
            const { bot, group_chat_id } = bots[category];
            const receiver = chat_type[chat_type.length-1] == 'private' ? telegram_id : group_chat_id;
            // 
            const inline_keyboard = await async_get_telegram('betKeyboard');
            if(chat_type[chat_type.length-1] != 'private'){
                inline_keyboard.push([
                    { "text": "🤖 私聊天机器人投注", "url": "https://t.me/jlfc_" + category + "_bot"}
                ])
            }
            // 
            bot.telegram.sendMessage(receiver, data, { 
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard },
                reply_to_message_id: message_id
            });
            bot.catch((err) => {
                // console.log('Ooops', err)
            })
        }
        // 
        if(platform=='user'&&path[0]!='game'&&path[1]!='bet') 
        {
            const keyboard = await async_get_telegram('walletKeyboard');
            // 
            wallet.telegram.sendMessage(telegram_id, data, { 
                parse_mode: 'HTML',
                reply_to_message_id: message_id,
                reply_markup: {
                    keyboard,
                    resize_keyboard: true,
                }
            });
        }
        if(platform=='agent'&&path[0]=='charge'&&path[1]=='go') 
        {
            wallet.telegram.sendMessage(telegram_id, data, { parse_mode: 'HTML' });
        }
        // 
    } catch (error) {
        // console.log(error)
    }
}
//
const sub_name = 'sd28_sub_do_list';
const startWaitMsg = async(c) => 
{
    await redis_2_ltrim('sd28_sub_do_list', 2, 1);
    // 
    while(true) {
        let res = null;
        try {
            res = await redis_2_brpop(sub_name, 0);
            // console.log(res);
            await dataChange(res[1]);
        }
        catch(err) {
            // console.log('brpop 出错，重新brpop')
            continue
        }
        // 
        // await dataChange(res[1]);
    }
}
startWaitMsg();