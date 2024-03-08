'use strict';
// 
const { us, lottery, sd28 } = require('../config/config');
//
const { promisify } = require("util");
const redis = require("redis");
// 
const client_us = redis.createClient(us);
const client_lottery = redis.createClient(lottery);
const client_sd28 = redis.createClient(sd28);
//
const redis_sd28_pub = promisify(client_sd28.publish).bind(client_sd28);
// 
const redis_lottery_sets = promisify(client_lottery.set).bind(client_lottery);
const redis_lottery_gets = promisify(client_lottery.get).bind(client_lottery);
const redis_lottery_llen = promisify(client_lottery.llen).bind(client_lottery); // 读取列表数量
const redis_lottery_lrange = promisify(client_lottery.lrange).bind(client_lottery); // 读取 lrangeAsync(name, 0, -1);
const redis_lottery_lindex = promisify(client_lottery.lindex).bind(client_lottery);
const redis_lottery_lset = promisify(client_lottery.lset).bind(client_lottery); // 更改列表值 lsetAsync(name, 0, value)
const redis_lottery_lpush = promisify(client_lottery.lpush).bind(client_lottery); // 左加入 redis_lottery_lpush(name, jsp)
const redis_lottery_rpop = promisify(client_lottery.rpop).bind(client_lottery); // 右弹出 redis_lottery_brpop(name)
const redis_lottery_ltrim = promisify(client_lottery.ltrim).bind(client_lottery); // 删除 ltrimAsync(name, 0, -1);
const redis_lottery_subscribe = redis.createClient(lottery);
const redis_lottery_setex = promisify(client_lottery.setex).bind(client_lottery);
const redis_lottery_brpop = promisify(client_lottery.brpop).bind(client_lottery);
const redis_lottery_linsert = promisify(client_lottery.linsert).bind(client_lottery);
// 
// 读取
const redis_lottery_get = async(n) => 
{
    const d = await redis_lottery_gets(n);
    if(!d) return '';
    return JSON.parse(d);
}
// 设置
const redis_lottery_set = async(n,d) => 
{
    if(!d) return '';
    return await redis_lottery_sets(n, JSON.stringify(d));
}
// list读取
const redis_lottery_list = async(n, a=0, b=-1) => 
{
    const _list = await redis_lottery_lrange(n, a, b);
    if(!_list) return '';
    let _r = [];
    try {
        for(let i in _list)
        {
            _r.push(JSON.parse(_list[i]));
        }
    } catch (error) {
        
    }
    return _r;
}
//
const redis_us_subs = redis.createClient(us);
// 
const redis_us_brpop = promisify(client_us.brpop).bind(client_us);
const redis_us_ltrim = promisify(client_us.ltrim).bind(client_us); // 删除 ltrimAsync(name, 0, -1);
const redis_us_lindex = promisify(client_us.lindex).bind(client_us);
const redis_us_llen = promisify(client_us.llen).bind(client_us); // 读取列表数量
const redis_us_get = promisify(client_us.get).bind(client_us); // 读取
const redis_us_lpush = promisify(client_us.lpush).bind(client_us);
//
// 
module.exports = 
{
    redis_sd28_pub,
    // redis_sd28_lpush,
    client_sd28,
    client_us,
    // 
    redis_lottery_subscribe,
    // 
    redis_lottery_set,
    redis_lottery_get,
    redis_lottery_llen,
    redis_lottery_lrange,
    redis_lottery_list,
    redis_lottery_lindex,
    redis_lottery_lset,
    redis_lottery_lpush,
    redis_lottery_linsert,
    redis_lottery_rpop,
    redis_lottery_ltrim,
    redis_lottery_setex,
    redis_lottery_brpop,
    // 
    redis_us_brpop,
    redis_us_ltrim,
    redis_us_lindex,
    redis_us_llen,
    redis_us_get,
    redis_us_lpush,
    redis_us_subs,
};