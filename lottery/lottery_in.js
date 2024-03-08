//
const { redis_us_subs, redis_lottery_lpush, redis_lottery_lrange, redis_sd28_pub, client_us } = require('./tool/redis');
// 
const sub_name = 'lottery_open_data';
const sub_list = 'lottery_open_list';
const pub_admin = 'sd28-admin-data'; 
// 
const startSub = async() => 
{
    redis_us_subs.subscribe(sub_name);
    redis_us_subs.on("message", async(channel, message) =>
    {
        // console.log(channel, message);
        try { 
            await redis_lottery_lpush(sub_list, message);
            await redis_sd28_pub(pub_admin, JSON.stringify({ LotteryNewAdd: JSON.parse(message) }));
            // 
            const { category } = JSON.parse(message)
            if(category=='btc') { 
                redis_us_subs.ping((err, reply) => {})
                client_us.ping((err, reply) => {})
            }
            //
        } catch (error) {
            
        }
    })
}
// 
startSub();