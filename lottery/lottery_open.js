//
const { redis_lottery_brpop, redis_us_subs, client_us } = require('./tool/redis');
const { gameIn } = require('./tool/gameOpt');
// 
const sub_list = 'lottery_open_list';
//
const startWaitMsg = async() => 
{
    while(true) {
        let res = null;
        try {
            res = await redis_lottery_brpop(sub_list, 0);
            const d = JSON.parse(res[1]);
            const { category } = d; 
            // console.log(category)
            if(category=='btc') {
                redis_us_subs.ping((err, reply) => {})
                client_us.ping((err, reply) => {})
            }
            await gameIn(d);
        }
        catch(err) {
            continue
        }
    }
}
// 
startWaitMsg();