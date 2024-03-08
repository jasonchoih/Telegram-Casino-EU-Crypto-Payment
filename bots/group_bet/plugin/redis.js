'use strict';
// 
const { redis_1_Config, redis_2_Config, redis_5_Config } = require('../config/config');
const dayjs = require("dayjs");
const { promisify } = require("util");
const redis = require("redis");
// 
const client_1 = redis.createClient(redis_1_Config);
const redis_1_index = promisify(client_1.lindex).bind(client_1);
const lrange_1_Async = promisify(client_1.lrange).bind(client_1); 
// 
const client_2 = redis.createClient(redis_2_Config);
const get_2_async = promisify(client_2.get).bind(client_2);
//
const lpush_2 = promisify(client_2.lpush).bind(client_2);
// 
const client_tx = redis.createClient(redis_5_Config);
// 
const get_telegram = promisify(client_tx.get).bind(client_tx);
const set_telegram = promisify(client_tx.set).bind(client_tx);
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
const get_2 = async(name) => 
{
    const d = await get_2_async(name);
    if(!d) return '';
    return JSON.parse(d);
}
const SubDo = async(d) => 
{
    await lpush_2('sd28_sub_do_list', JSON.stringify({ 
        platform: 'user',
        ...d
    }));
}
// 
const redis_1_lottery_fou_peroids_time = async(n) => 
{
    const _list = await lrange_1_Async('lottery_fou_'+n, 0, 3);
    if(!_list) return '';
    let _r = [];
    try {
        for(let i in _list)
        {
            const _d = JSON.parse(_list[i]);
            _r.push([
                _d.peroids,
                _d.time,
            ]);
        }
    } catch (error) {
        
    }
    if(_r.length<=0) return '';
    return _r;
}
// 
const get_1_List_fou_new = async(n) => 
{
    const _one = await redis_1_index('lottery_fou_'+n, 3);
    if(!_one) return '';
    return JSON.parse(_one);
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
module.exports = 
{
    redis_1_lottery_fou_peroids_time,
    redis_1_lottery_fou,
    get_2,
    SubDo,
    get_1_List_fou_new,
    // 
    async_set_telegram,
    async_get_telegram
};