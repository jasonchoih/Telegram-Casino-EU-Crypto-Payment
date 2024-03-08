'use strict';
// 
const { lottery, sd28, sd28_auto } = require('../config/config');
//
const { promisify } = require("util");
const redis = require("redis");
// 
const client_lottery = redis.createClient(lottery);
const client_sd28 = redis.createClient(sd28);
const client_sd28_auto = redis.createClient(sd28_auto);

// ----lottery----
const redis_lottery_sets = promisify(client_lottery.set).bind(client_lottery);
const redis_lottery_gets = promisify(client_lottery.get).bind(client_lottery);
const redis_lottery_lrange = promisify(client_lottery.lrange).bind(client_lottery); // 读取 lrangeAsync(name, 0, -1);
const redis_lottery_lindex = promisify(client_lottery.lindex).bind(client_lottery);
const redis_lottery_lset = promisify(client_lottery.lset).bind(client_lottery); // 更改列表值 lsetAsync(name, index, value)
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

// ----sd28----
const redis_sd28_pub = promisify(client_sd28.publish).bind(client_sd28); 
const redis_sd28_gets = promisify(client_sd28.get).bind(client_sd28);
const redis_sd28_llen = promisify(client_sd28.llen).bind(client_sd28);
const redis_sd28_lindex = promisify(client_sd28.lindex).bind(client_sd28);
const redis_sd28_lpush = promisify(client_sd28.lpush).bind(client_sd28);
// 读取
const redis_sd28_get = async(n) => 
{
    const d = await redis_sd28_gets(n);
    if(!d) return '';
    return JSON.parse(d);
}
// 处理中心
const SubDo = async(d) => 
{
    await redis_sd28_lpush('sd28_sub_do_list', JSON.stringify({ 
        platform: 'user', // 默认，指定平台为用户，即目录
        ...d
    }));
}
// ----auto----
const redis_sd28_auto_subscribe = redis.createClient(sd28_auto);
const redis_sd28_auto_sets = promisify(client_sd28_auto.set).bind(client_sd28_auto);
const redis_sd28_auto_gets = promisify(client_sd28_auto.get).bind(client_sd28_auto);
const redis_sd28_auto_setex = promisify(client_sd28_auto.setex).bind(client_sd28_auto);
// 读取
const redis_sd28_auto_get = async(n) => 
{
    const d = await redis_sd28_auto_gets(n);
    if(!d) return '';
    return JSON.parse(d);
}
// 设置
const redis_sd28_auto_set = async(n,d) => 
{
    if(!d) return '';
    return await redis_sd28_auto_sets(n, JSON.stringify(d));
}
// 
module.exports = 
{
    redis_sd28_pub,
    redis_sd28_get,
    // 
    redis_sd28_auto_subscribe,
    redis_sd28_auto_setex,
    redis_sd28_auto_get,
    redis_sd28_auto_set,
    // 
    redis_sd28_lpush,
    redis_sd28_llen,
    redis_sd28_lindex,
    // 
    redis_lottery_get,
    redis_lottery_set,
    redis_lottery_list,
    redis_lottery_lindex,
    redis_lottery_lset,
    // 
    SubDo
};