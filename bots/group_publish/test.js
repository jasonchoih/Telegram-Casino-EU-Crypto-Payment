const { redis_2_sub, get_2, async_get_telegram, async_get_auto_bot, async_set_auto_bot, redis_1_lottery_fou, get_1 } = require('./plugin/redis'); 
// 
// redis_2_sub.subscribe('sd28-site-room');
// redis_2_sub.on("message", async(channel, message) => 
// {
//     const { controller, game, data, category, peroids } = JSON.parse(message);
//     //
//     if(controller=='game_lottery_open'){
//         console.log(JSON.parse(message))
//     }

// })
const test = async() =>
{
    const a = await get_1('lottery_last_jnd')
    // console.log(a)
    const pk = a['pk']['sc']
    console.log(pk)
    // console.log(pk.slice(0,3))
    // const jnd =a['jnd']['28']
    // console.log(jnd)
}
test()