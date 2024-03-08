'use strict';
// 
const { redis_2_Config, redis_5_Config } = require('../config/config');
//
const { promisify } = require("util");
const redis = require("redis");
// 
const client_2 = redis.createClient(redis_2_Config);
const lpush_2 = promisify(client_2.lpush).bind(client_2);
const get_2_async = promisify(client_2.get).bind(client_2);
// 
const client_tx = redis.createClient(redis_5_Config);
// 
const get_telegram = promisify(client_tx.get).bind(client_tx);
const set_telegram = promisify(client_tx.set).bind(client_tx);
// 
const redis_2_pub = redis.createClient(redis_2_Config);
// 
const SubDo = async(d) => 
{
    await lpush_2('sd28_sub_do_list', JSON.stringify({ 
        platform: 'user', 
        ...d
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
const async_set_telegram = async(n, d) => 
{
    return await set_telegram(n, JSON.stringify(d));
}
// 
const get_2 = async(name) => 
{
    const d = await get_2_async(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 
module.exports = 
{
    SubDo,
    async_get_telegram,
    async_set_telegram,
    get_2,
    redis_2_pub
};