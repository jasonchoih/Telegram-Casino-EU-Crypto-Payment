'use strict';
// 
const { redis_1_Config, redis_2_Config } = require('../config/config');
const { promisify } = require("util");
const redis = require("redis");
// 
const client_1 = redis.createClient(redis_1_Config);
const lrange_1_Async = promisify(client_1.lrange).bind(client_1); 
// 
const client_2 = redis.createClient(redis_2_Config);
const lpush_2 = promisify(client_2.lpush).bind(client_2);
const get_2_async = promisify(client_2.get).bind(client_2);
// 
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
// 
const SubDo = async(d) => 
{
    await lpush_2('sd28_sub_do_list', JSON.stringify({ 
        platform: 'user',
        ...d
    }));
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
    get_1_List,
    lrange_1_Async,
    get_2
};