// 
const dayjs = require('dayjs');
const { 
    //
    redis_sd28_pub,
    //
    redis_lottery_set,
    redis_lottery_llen,
    redis_lottery_list,
    redis_lottery_lindex,
    redis_lottery_lset,
    redis_lottery_lpush,
    redis_lottery_ltrim,
    redis_lottery_setex,
    redis_lottery_lrange,
    redis_lottery_rpop
} = require('./redis');
const { getNextPeroidsTime } = require('./gameTime');
// 数组随机顺序
// 数组随机顺序
const randomsort = (a, b) => 
{
    return Math.random() > .5 ? -1 : 1;
}
//
const yc_fix = 'yc_'; 
// 
const _ds = async(type, jg) => 
{
    // 大于
    const _dx = {
        '28': 13,
        '11': 6,
        '16': 10,
        //
        '10': 5,
        '22': 16,
        'sc': 11,
        'gyh': 11,
        'gj': 5,
    }
    const _n = _dx[type];
    let _r = [ '', '' ];
    // 
    _r[0] = _n<parseInt(jg) ? 'da' : 'xiao';
    _r[1] = jg%2==0 ? 'shuang' : 'dan';
    //
    return _r;
}
//
const types = async(category) => 
{
    if(category=='pk')
    {
        return [ 'gyh', 'sc', '10', '22', 'gj', 'lh' ];
    }
    return [ 28,11,16,36 ];
}
// 
const ycs = async(type) =>
{
    let a;
    if(type=='36')
    {
        a = [ 'ban','za','dui','bao','shun' ].sort(randomsort);
        return [ a[0], a[1] ];
    }
    if(type=='lh')
    {
        a = [ 'long', 'hu' ].sort(randomsort);
        return [ a[0] ];
    }
    // 
    a = [
        [ 'da','xiao'].sort(randomsort),
        ['dan','shuang'].sort(randomsort)
    ];
    return [ a[0][0], a[1][0] ];
}
// 
const _is_win = async(category, type, v, y) => 
{
    v = v[category];
    let _w=1;
    let _v;
    if(type=='36')
    {
        _v = v['36'][1];
        _w = y.find(v=>v==_v); 
        return [
            v['36'],
            [ _v ],
            y,
            _w?1:2
        ]
    }
    if(type=='lh')
    {
        _v = v['lh'][1];
        _w = y.find(v=>v==_v); 
        return [
            v['lh'],
            [ _v ],
            y,
            _w?1:2
        ]
    }
    let _jg = v[type];
    if(type=='sc')
    {
        _jg = [ _jg[0], _jg[1][0] ];
        _v = await _ds(type, _jg[1]);
    }else{
        _v = await _ds(type, _jg[1]);
    }
    if(y[0]!=_v[0] && y[1]!=_v[1]) _w=2;
    return [
        _jg,
        _v,
        y,
        _w
    ]
}
//
const contro = async(category_old, category, d) => 
{
    // console.log(category);
    const { peroids, time } = d;
    const _types = await types(category);
    const _n = yc_fix+''+category;
    //
    // 更新
    let _list = await redis_lottery_list(_n, 0, -1);
    let _this = _list.find(v=>v[0]==peroids);
    if(_this)
    {
        let _new_jg = {}
        for(let i in _this[2])
        {
            _new_jg[i] = await _is_win(category, i, d, _this[2][i][2]);
        }
        _this[2] = _new_jg;
        // 
        const _index = _list.findIndex(v=>v[0]==peroids);
        await redis_lottery_lset(_n, _index, JSON.stringify(_this));
    }
    // 插入
    const _next = await getNextPeroidsTime(category_old, time);
    let _news = [
        parseInt(peroids)+1, // 期数
        dayjs(_next.time).format('MM-DD HH:mm:ss'), // 时间
    ];
    let _yc = {};
    for(let i in _types)
    {
        const _t = _types[i];
        _yc[_t] = [
            '-', // 开奖号码
            [], // 开奖号码
            await ycs(_t), // 预测
            '-' // 是否中奖
        ];
    }
    _news.push(_yc);
    await redis_lottery_lpush(_n, JSON.stringify(_news));
    await redis_lottery_ltrim(_n, 0, 29);
    //
    _list = await redis_lottery_list(_n, 0, -1);
    // console.log('--------------------------------------');
    // console.log(category, JSON.stringify(_list));
} 
//
const ycIn = async(category,d) => 
{
    if(category=='jnd')
    {
        await contro(category, 'jnd', d);
        await contro(category, 'pk', d);
        return;
    }
    if(category=='ddbj')
    {
        await contro(category, 'dd', d);
        await contro(category, 'bj', d);
        return;
    }
    await contro(category, category,  d);
}
// 
module.exports = 
{
    ycIn
};