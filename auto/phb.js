// 
const dayjs = require('dayjs');
const { QueryTypes, sequelize } = require('./sequelize/db28');
const { 
    redis_sd28_pub, 
    //
    redis_sd28_auto_subscribe,
    redis_sd28_auto_setex,
    redis_sd28_get, redis_sd28_auto_get, redis_sd28_auto_set,
    SubDo
} = require('./tool/redis');
const schedule = require('node-schedule');
const { twoNumberRandom, randSort } = require('./tool/tool');
const { man } = require('./tool/bot');
// 
const [ 
    gameAutoMan, 
    rankTodays, rankToday, rankTodayView,
    rankYestoday,
    rankWeek,
] = [ 
    'gameAutoMan', 
    'rank_todays', 'rank_today', 'rank_today_view',
    'rank_yestoday', 
    'rank_week',
];
// the more people the less money, the less people the more money
const _phb_man_money = 35; 
// 
const nameChangeCut = async(d) =>
{
    let _r = [];
    for(let i in d)
    {
        const _di = d[i];
        _r.push([
            _di[0],
            _di[1],
        ]);
    }
    _r = _r.slice(0, 30);
    return _r;
}
// 获取中奖用户排名
const getUserDayWin = async(time) => 
{
    const lists = await sequelize.query('SELECT '+
    'b.id,b.nick,a.win '+
    'FROM user_day_data a LEFT JOIN users b ON a.user_id=b.id '+
    'WHERE a.time=? and a.win>0 ORDER BY a.win DESC Limit 30',
    {
        replacements: [time],
        type: QueryTypes.SELECT,
        plain: false,
    });
    let _r = [];
    if(lists)
    {
        for(let i in lists)
        {
            const _li = lists[i];
            _r.push([
                _li.nick,
                _li.win,
                _li.id,
            ]);
        }
    }
    return _r;
}
// 两个数组合并
const twoArrayContact = async(a,b,type) => 
{
    let n = [];
    for(let i in a)
    {
        const ai = a[i];
        const bi = b.find(v=>v[0]==ai[0]);
        if(bi)
        {
            n.push([
                ai[0],
                parseInt(ai[1]+bi[1])
            ]);
        }else{
            // if(type)
            // {
            //     n.push([
            //         ai[0],
            //         await rankType(ai[1],0,type)
            //     ])
            // }else{
                n.push(ai)
            // }
        }
    }
    for(let i in b)
    {
        const bi = b[i];
        if(!n.find(v=>v[0]==bi[0]))
        {
            n.push(bi);
        }
    }
    n.sort( (aa, bb) => { return bb[1] - aa[1] });
    return n.slice(0, 30);
}
// 随机金额
const rankArrDou = async(arr) => 
{
    const dous = [100,800,500,102,3000,600,170,150,260,166,178,192,450,325,786,1329,1100,1500,3000,166,100,800,500,102,30000,600,170,1500,260,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,10000,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,20000,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,3000,20000,1500,300,166,100,800,500,102,3000,600,170,178,192,450,325,786,150,260,40000,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,1500,300,166,5600,100,800,500,102,3000,600,170,150,260,1100,25000,1500,300,166,8800,100,800,500,102,3000,600,170,150,260,5000,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,1500,300,166,10000,100,800,500,102,3000,600,170,150,260,1100,1500,300,166,50000,178,192,450,325,786,1329];
    //
    const _d = (await randSort(dous)).slice(0, arr.length);
    // 
    let _r = {};
    for(let i in arr)
    {
        // Line 121 multiply 15 is to control the amount of money in the PHB
        const _i = arr[i]+'';
        _r[_i] = parseInt( _d[i] * 1000 * Math.random() * 20 );
    }
    // 
    return _r
}
// 随机方式
const rankType = async(a,b,_rank=6) => 
{
    let _ra = (await randSort([0,1,2,3,4,5,6,7,8,9]))[2];
    let _rb = (await randSort([
        0.1,0.2,
        0.3,0.4,0.5,0.6,0.7,
        0.3,0.4,0.5,0.6,0.7,
        0.8,0.9,
        1
    ]))[3];
    //
    if(_ra>_rank)
    {
        const _sum = parseInt(a*_rb)
        return _sum>0 ? _sum : 0;
    }
    return parseInt(a+b);
}
// 默认
const arr30 = Array.from(Array(60), (v,k) =>k);
// 
const todayChange = async(d) => 
{
    let data = [];
    for(let i=0;i<30;i++)
    {
        let _di = d[i];
        if(_di[1]>0)
        {
            data.push(_di)
        }else{
            data.push(['-',0]);
        }
    }
    // 
    await redis_sd28_auto_set(rankToday, data);
    // 
    const time = dayjs().format('YYYY-MM-DD');
    const _user_win = await getUserDayWin(time);
    if(_user_win && _user_win.length>0) data = [ ..._user_win, ...data ];
    // 
    data.sort( (a, b) => { return b[1] - a[1] });
    data = await nameChangeCut(data);
    // 
    await redis_sd28_auto_set(rankTodayView, data);
    // 
    // await redis_sd28_pub('sd28-site-room', JSON.stringify({
    //     controller: 'rank',
    //     data:{
    //         RankToday: data
    //     }
    // }));
}
// 
const yestodayChange = async() => 
{
    let _today = await redis_sd28_auto_get(rankTodays);
    const time = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const _user_win = await getUserDayWin(time);
    const _phb = await redis_sd28_get('PhbjlSet');
    // 
    let _now = _today;
    if(_user_win && _user_win.length>0) _now = [ ..._user_win, ..._now ];
    _now.sort( (a, b) => { return b[1] - a[1] });
    if(_user_win && _user_win.length>0)
    {
        const _i = _now.findIndex(v=>v[0]==_user_win[0][0]);
        if(_i>0) _now.slice(_i+1);
    }
    // 
    let _pr = 0;
    for(let i=1;i<31;i++)
    {
        if(_phb['pk'+i]===true)
        {
            _pr = i;
            break;
        }
    }
    let _new = [];
    let _today_length = _today.length;
    for(let i=1;i<_pr;i++)
    {
        let _new_i = _today[_today_length-i];
        _new.push([
            _new_i[0],
            parseInt(_user_win[0][1] * (1+await twoNumberRandom(0.18+(i/10),(1.19))))
        ]);
    }
    _new = [ ..._now, ..._new ];
    _new.sort( (a, b) => { return b[1] - a[1] });
    _new = _new.slice(0,30);
    //
    // let _user_rank = {};
    for(let i in _new)
    {
        const _new_i = _new[i];
        const _iii = parseInt(i)+1;
        if(_new_i[2])
        {
            // _user_rank[_new_i[2]] = _iii;
            await SubDo({ 
                path:[ 'rank', 'rank_update' ],
                data:{ user_id:_new_i[2], rank:_iii  }
            });
        }
        _new[i][2] = _phb['p'+_iii];
    }
    // _user_rank { '888800': 5, '892619': 4 }
    // console.log('0-----------------------', _phb, _now, _i, _pr, _new, _new.length, _user_rank);
    // 
    await redis_sd28_auto_set(rankYestoday, _new);
    //
    // await redis_sd28_pub('sd28-site-room', JSON.stringify({
    //     controller: 'rank',
    //     data:{
    //         RankYestoday: _new
    //     }
    // }));
}
//
const weekChange = async() => 
{
    const _today = await redis_sd28_auto_get(rankTodayView);
    // 
    const getWeek = await redis_sd28_auto_get(rankWeek);
    // 
    const n = await twoArrayContact(getWeek, _today, 7);
    // 
    await redis_sd28_auto_set(rankWeek, n);
    //
    // await redis_sd28_pub('sd28-site-room', JSON.stringify({
    //     controller: 'rank',
    //     data:{
    //         RankWeek: n
    //     }
    // }));
}
//
const minuteRun = async() => 
{
    // console.time();
    // 
    let get_todays = await redis_sd28_auto_get(rankTodays);
    // 
    let num = (await randSort([5,6,7,8,9,10,11,12,13,14,15]))[2]; 
    let rank_keys = (await randSort(arr30)).slice(0, num);
    let rank_dous = await rankArrDou(rank_keys);
    // 
    let _n = [];
    for(let i in get_todays)
    {
        if(rank_keys.find(v=>v==i))
        {
            _n.push([
                get_todays[i][0],
                await rankType(get_todays[i][1], rank_dous[i])
            ]); 
        }else{
            _n.push(get_todays[i])
        }
    }
    _n.sort( (a, b) => { return b[1] - a[1] });
    // 
    await redis_sd28_auto_set(rankTodays, _n);
    // 
    await todayChange(_n);
    // 
    // console.timeEnd();
}
// 每天执行 - 初始执行
const dayRun = async() => 
{
    // 生成 - 昨日数据 - 本周数据
    const __today = await redis_sd28_auto_get(rankTodayView);
    if(__today)
    {
        await yestodayChange(__today);
        await weekChange(__today);
    }
    // 清空今天数据
    let _today = [];
    for(let i=0;i<30;i++)
    {
        _today.push(['-',0]);
    }
    await redis_sd28_auto_set(rankToday, _today);
    // 取得新机器人
    let _man = await redis_sd28_auto_get(gameAutoMan);
    // 随机获取前30位
    // _man = (await randSort(_man)).slice(0,40);
    _man = (await randSort(_man)).slice(0,_phb_man_money);
    // 设置当日虚拟机器人待位
    let _todays = [];
    for(let i in _man)
    {
        _todays.push([_man[i], 0]);
    }
    await redis_sd28_auto_set(rankTodays, _todays);
    // 
    // await redis_sd28_pub('sd28-site-room', JSON.stringify({
    //     controller: 'rank',
    //     data:{
    //         RankToday: _today
    //     }
    // }));
    // 
    await minuteRun();
}
// 周处理
const weekRun = async() => 
{
    // 清空今天数据
    let _today = [];
    for(let i=0;i<30;i++)
    {
        _today.push(['-',0]);
    }
    await redis_sd28_auto_set(rankWeek, _today);
    //
    // await redis_sd28_pub('sd28-site-room', JSON.stringify({
    //     controller: 'rank',
    //     data:{
    //         RankWeek: _today
    //     }
    // }));
}
// 初始执行
const _start = async() => 
{
    // await dayRun();
    // 每分钟执行
    schedule.scheduleJob('6 * * * * *', async() => 
    // schedule.scheduleJob('*/2 * * * * *', async() => 
    {
        await minuteRun();
    });
    // 每天执行            S M H D Mo DW
    schedule.scheduleJob('3 0 0 */1 * *', async() => 
    // schedule.scheduleJob('3 */3 * * * *', async() => 
    {
        await dayRun();
    });
    // 每星期一执行
    schedule.scheduleJob('0 0 0 * * 0', async() => 
    {
        await weekRun();
    });
}
//
const other = async() => 
{
    // 更换机器人
    await redis_sd28_auto_set(gameAutoMan, man);
}
other()
// 
// _start();
