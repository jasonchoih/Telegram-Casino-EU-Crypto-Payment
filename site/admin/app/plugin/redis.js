'use strict';
// 
const { redis_us_Config, redis_1_Config, redis_2_Config, 
    redis_aws_kill_Config, redis_5_Config
} = require('../config/config');
//
const { promisify } = require("util");
const redis = require("redis");
// us - lottery
const client_us = redis.createClient(redis_us_Config);
const get_us_async = promisify(client_us.get).bind(client_us);
const set_us_async = promisify(client_us.set).bind(client_us);
const pub_us_asysc = promisify(client_us.publish).bind(client_us);
// 1 - lottery
const client_1 = redis.createClient(redis_1_Config);
const get_1_async = promisify(client_1.get).bind(client_1);
const lrange_1_Async = promisify(client_1.lrange).bind(client_1); // 读取 lrangeAsync(name, 0, -1);
const redis_1_index = promisify(client_1.lindex).bind(client_1);
const redis_1_ltrim = promisify(client_1.ltrim).bind(client_1); // 删除 ltrimAsync(name, 0, -1);
// 2 - sd28
const client_2 = redis.createClient(redis_2_Config);
const get_2_async = promisify(client_2.get).bind(client_2);
const set_2_async = promisify(client_2.set).bind(client_2);
// const lrange_2_async = promisify(client_2.lrange).bind(client_2);
// 
const redis_2_pub = redis.createClient(redis_2_Config);
const redis_2_sub = redis.createClient(redis_2_Config);
//
const redis_2_room_sub = redis.createClient(redis_2_Config);
// const redis_2_game_room_sub = redis.createClient(redis_2_Config);
//

const lpush_2 = promisify(client_2.lpush).bind(client_2);

// auto kill
const redis_aws_kill = redis.createClient(redis_aws_kill_Config);
const redis_aws_kill_lpush = promisify(redis_aws_kill.lpush).bind(redis_aws_kill);
const redis_aws_kill_set = promisify(redis_aws_kill.set).bind(redis_aws_kill);
// 
const client_tx = redis.createClient(redis_5_Config);
// 
const get_telegram = promisify(client_tx.get).bind(client_tx);
const set_telegram = promisify(client_tx.set).bind(client_tx);
// 
// ===============================================================
// 
redis_2_sub.subscribe('sd28-site-room');
redis_2_sub.on("message", async(channel, message) =>
{
    const { controller, category } = JSON.parse(message);
    // 
    if(controller=='game_lottery_open'&&category=='btc')  // Open for Betting
    {
        client_us.ping((err, reply) => { });
        redis_aws_kill.ping((err, reply) => { });
    }
})
// 
// ================================================================
// 读取 1
const get_1 = async(name) => 
{
    const d = await get_1_async(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 读取 1 list
const get_1_List = async(n, a=0, b=-1) => 
{
    const _list = await lrange_1_Async('lottery_list_'+n, a, b);
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
const get_1_List_new_one = async(n) => 
{
    const _list = await lrange_1_Async('lottery_list_'+n, 0, 50);
    if(!_list) return '';
    try {
        for(let i in _list)
        {
            let _this = JSON.parse(_list[i]);
            if(_this.number) return _this;
        }
    } catch (error) {
        
    }
    return '';
}
const get_1_List_last_one = async(n) => 
{
    const _list = await lrange_1_Async('lottery_list_'+n, 0, 0);
    if(!_list) return '';
    return JSON.parse(_list[0]);
}
const get_1_List_last_peroids = async(n) => 
{
    const _list = await lrange_1_Async('lottery_list_'+n, -1, -1);
    if(!_list) return '';
    return JSON.parse(_list[0]);
}
const get_1_List_fou_new = async(n) => 
{
    const _one = await redis_1_index('lottery_fou_'+n, 3);
    if(!_one) return '';
    return JSON.parse(_one);
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
    return await set_2_async(n, JSON.stringify(d));
}

// 发送更新 - 将金豆数据发送到另一台服务器进行队列更新
const SubDo = async(d) => 
{
    await lpush_2('sd28_sub_do_list', JSON.stringify({ 
        ...d, 
        platform: 'admin' // 指定平台为用户
    }));
}
// 
const async_get_telegram = async(name) => 
{
    const d = await get_telegram(name);
    if(!d) return '';
    return JSON.parse(d);
}
const async_set_telegram = async(n, d) => 
{
    return await set_telegram(n, JSON.stringify(d));
}
// 
module.exports = 
{
    get_us_async,
    set_us_async,
    pub_us_asysc,
    //
    get_1,
    get_1_List,
    get_1_List_new_one,
    get_1_List_last_one,
    get_1_List_last_peroids,
    get_1_List_fou_new,
    redis_1_ltrim,
    // 
    get_2,
    set_2,
    // lrangeAsync,
    // getList,
    // getZst
    lpush_2,
    redis_2_pub,
    redis_2_sub,
    redis_2_room_sub,
    SubDo,
    // 
    redis_aws_kill_lpush,
    redis_aws_kill_set,
    // 
    async_get_telegram,
    async_set_telegram
};