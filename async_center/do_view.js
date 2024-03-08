//
const { redis_2_pub, redis_2_brpop, redis_2_ltrim } = require('./tool/redis');
const { PAGEREQUEST, PAGEVIEW } = require('./sequelize/db28');
// 
let types = {};
types['view'] = async(d) => 
{
    // await PAGEVIEW.create(d);
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({PageView:Object.values(d)}));
}
types['request'] = async(d) => 
{
    // await PAGEREQUEST.create(d);
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({PageRequest:Object.values(d)}));
}
//
const sub_name = 'sd28_request_view_data';
const startWaitMsg = async(c) => 
{
    while(true) {
        let res = null;
        try {
            res = await redis_2_brpop(sub_name, 0);
            // console.log(res);
            const __d = JSON.parse(res[1]);
            await types[__d.type](__d.data);
        }
        catch(err) {
            continue
        }
    }
}
// 
const test = async() => 
{
    await redis_2_ltrim(sub_name, 0, 100);
    await startWaitMsg();
}
test();