'use strict';
// 
const { redis_1_Config, redis_2_Config, redis_3_Config, redis_5_Config } = require('../config/config');
const dayjs = require("dayjs");
const { promisify } = require("util");
const redis = require("redis");
//
const client_1 = redis.createClient(redis_1_Config);
const redis_1_index = promisify(client_1.lindex).bind(client_1);
const lrange_1_Async = promisify(client_1.lrange).bind(client_1);
const get_1_async = promisify(client_1.get).bind(client_1);
// 
const client_2 = redis.createClient(redis_2_Config);
const get_2_async = promisify(client_2.get).bind(client_2);
//
const redis_2_sub = redis.createClient(redis_2_Config);
// 
const client_tx = redis.createClient(redis_5_Config);
const set_telegram = promisify(client_tx.set).bind(client_tx);
const get_telegram = promisify(client_tx.get).bind(client_tx);
// 
const client_auto = redis.createClient(redis_3_Config);
const set_auto_bot = promisify(client_tx.set).bind(client_auto);
const get_auto_bot = promisify(client_tx.get).bind(client_auto);
// 
const redis_1_lottery_fou = async(n,category,type) => 
{
    const _list = await lrange_1_Async('lottery_fou_'+n, 0, 3);
    if(!_list) return '';
    let _r = [];
    try {
        for(let i in _list)
        {
            const _d = JSON.parse(_list[i]);
            const _p = _d['p'][category][type];
            _r.push([
                _d.peroids,
                dayjs(_d.time).format('MM-DD HH:mm:ss'),
                '',
                '',
                '',
                2,
                [
                    _p[0], 
                    _p[1],
                    0,
                    0
                ]
            ]);
        }
    } catch (error) {
        
    }
    if(_r.length<=0) return '';
    return _r;
}
// 
const get_1 = async(name) => 
{
    const d = await get_1_async(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 
const get_2 = async(name) => 
{
    const d = await get_2_async(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 
const get_1_List_fou_new = async(n) => 
{
    const _one = await redis_1_index('lottery_fou_'+n, 3);
    if(!_one) return '';
    return JSON.parse(_one);
}
// 
const async_set_telegram = async(n, d) => 
{
    return await set_telegram(n, JSON.stringify(d));
}
// 
const async_get_telegram = async(name) => 
{
    const d = await get_telegram(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 
const async_set_auto_bot = async(n, d) => 
{
    return await set_auto_bot(n, JSON.stringify(d));
}
// 
const async_get_auto_bot = async(name) => 
{
    const d = await get_auto_bot(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 
// const test = async() =>
// {
//     const a = await async_get_auto_bot('ddbj_latest')
//     console.log(a)
// }
// test()
// 
module.exports = {
    redis_1_lottery_fou,   
    get_1,
    get_2,
    redis_2_sub,
    get_1_List_fou_new,
    async_set_telegram,
    async_get_telegram,
    // 
    client_auto,
    async_set_auto_bot,
    async_get_auto_bot
};