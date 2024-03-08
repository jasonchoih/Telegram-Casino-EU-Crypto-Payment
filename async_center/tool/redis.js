'use strict';
// 
const { redis_1_Config, redis_2_Config, redis_3_Config, redis_5_Config } = require('../config/config');
//
const { promisify } = require("util");
const redis = require("redis");
// 1
const client_1 = redis.createClient(redis_1_Config);
const get_1_async = promisify(client_1.get).bind(client_1);
const redis_1_brpop = promisify(client_1.brpop).bind(client_1);
//
const redis_1_lrange = promisify(client_1.lrange).bind(client_1); // 读取 lrangeAsync(name, 0, -1);
const redis_1_lset = promisify(client_1.lset).bind(client_1); // 更改列表值 lsetAsync(name, 0, value);
// 2
const client_2 = redis.createClient(redis_2_Config);
const get_2_async = promisify(client_2.get).bind(client_2);
const set_2_async = promisify(client_2.set).bind(client_2);
const redis_2_brpop = promisify(client_2.brpop).bind(client_2);
// const lrange_2_async = promisify(client_2.lrange).bind(client_2);
const redis_2_pub = redis.createClient(redis_2_Config);
const redis_2_pubs = promisify(redis_2_pub.publish).bind(redis_2_pub); 
const redis_2_lpush = promisify(client_2.lpush).bind(client_2); // 左加入 redis_lottery_lpush(name, jsp)
// const redis_2_sub = redis.createClient(redis_2_Config);
const redis_2_ltrim = promisify(client_2.ltrim).bind(client_2); // 删除 ltrimAsync(name, 0, -1);
// 
const client_tx = redis.createClient(redis_5_Config);
const get_telegram = promisify(client_tx.get).bind(client_tx);
// 
const client_3 = redis.createClient(redis_3_Config);
const get_3_async = promisify(client_3.get).bind(client_3);
const set_3_async = promisify(client_3.set).bind(client_3);
// 
// list读取
const redis_1_list = async(n, a=0, b=-1) => 
{
    const _list = await redis_1_lrange(n, a, b);
    if(!_list) return '';
    let _r = [];
    try {
        for(let i in _list)
        {
            _r.push(JSON.parse(_list[i]));
        }
    } catch (error) {
        
    }
    if(_r.length<=0) return '';
    return _r;
}
// 
// 读取 1
const get_1 = async(name) => 
{
    const d = await get_1_async(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 读取 2
const get_2 = async(name) => 
{
    const d = await get_2_async(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 设置
const set_2 = async(n, d) => 
{
    return await set_2_async(n, d);
}
// 后台 发送给 用户
const admin_to_user = async(d) => 
{
    if(!d) return;
    await redis_2_pubs('sd28-admin-to-user-room', JSON.stringify(d));
}
// 
const LooterySubDo = async(d) => 
{
    await redis_2_lpush('sd28_sub_do_list', JSON.stringify({ 
        ...d, 
        platform: 'lottery' // 指定平台为开奖的目录
    }));
}
// 
const async_get_telegram = async(name) => 
{
    const d = await get_telegram(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 
const get_3 = async(name) => 
{
    const d = await get_3_async(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 设置
const set_3 = async(n, d) => 
{
    return await set_3_async(n, d);
}
// 
module.exports = 
{
    redis_1_list,
    redis_1_lset,
    get_1,
    redis_1_brpop,
    // 
    get_2,
    set_2,
    // 
    redis_2_brpop,
    //
    redis_2_lpush,
    redis_2_pub,
    redis_2_pubs,
    redis_2_ltrim,
    admin_to_user,
    // 
    LooterySubDo,
    // 
    async_get_telegram,
    get_3,
    set_3

};