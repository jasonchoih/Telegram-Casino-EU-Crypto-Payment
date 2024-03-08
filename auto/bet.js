// 
const dayjs = require("dayjs");
const schedule = require('node-schedule');
const { 
    redis_lottery_list,
    redis_lottery_lset,
    redis_sd28_pub,
    //
    redis_sd28_auto_get,
    // 
    redis_sd28_llen,
    redis_sd28_lindex,
    //
} = require('./tool/redis');
const { twoNumberRandom, randSort } = require('./tool/tool');
// 
const lottery_fou_fix = 'lottery_fou_';
const categorys = [
    ['jnd', 30, 300 ],
    ['ddbj', 30, 300 ],
    ['jnc', 30, 300 ],
    ['elg', 25, 240 ],
    ['slfk', 30, 300 ],
    ['au', 20, 180 ],
    ['kr', 10, 90 ],
    ['btc', 5, 60 ],
];
// controlling the amount people betting in games page
const _bet_nums = [
    [2,5,2,2,3,6,3,1,2,5,3,1,3,3,4,2,2,1,3],
    [1,1,1,1,2,2,2,3,3]
];
// 
const odd = 
{
    // the higher the number the higher the money
    jnd: {
        11: 4.5,
        16: 4.5,
        28: 10,
        36: 4.5,
        '28gd': 7.8,
    },
    pk: {
        'sc': 3.2,
        'gyh': 2.2,
        10: 2.2,
        22: 2.2,
        'gj': 2.2,
        'lh': 2.2,
    },
    dd: {
        11: 3.2,
        16: 3.3,
        28: 6.5,
        36: 3.2,
        '28gd': 6,
    },
    bj: {
        11: 3.2,
        16: 3.3,
        28: 6.5,
        36: 3.2,
        '28gd': 6,
    },
    jnc: {
        11: 3.2,
        16: 3.3,
        28: 6.5,
        36: 3.2,
        '28gd': 6,
    },
    elg: {
        11: 2.2,
        16: 2.3,
        28: 4.5,
        36: 2.2,
        '28gd': 4,
    },
    slfk: {
        11: 2.2,
        16: 2.3,
        28: 4.5,
        36: 2.2,
        '28gd': 4,
    },
    btc: {
        11: 2.2,
        16: 3.2,
        28: 10,
        36: 3,
        '28gd': 8.2,
    },
    au: {
        11: 3.2,
        16: 2.3,
        28: 6.5,
        36: 3.2,
        '28gd': 6,
    },
    kr: {
        11: 2.2,
        16: 2.2,
        28: 6.5,
        36: 4,
        '28gd': 6,
    }
};
// 
const getfou = async() => 
{
    for(let i in categorys)
    {
        const _ci = categorys[i][0];
        const _cs = categorys[i][1];
        const _ps = categorys[i][2]*4;
        // 
        const _fou = await redis_lottery_list(lottery_fou_fix+_ci, 0, -1);
        const _this_time = _fou[3]['time'];
        const _second = dayjs(_this_time).diff(dayjs(), 'second');
        // console.log(_ci, _this_time, _second);
        if(_second>6 && _second<_ps)
        {
            await changeFou(_ci, _fou, (_second>_cs?0:1));
        }
    }
}
// 
const changeFou = async(category, _fou, stopbet) => 
{
    const _nn = [
        [3,3,3,3,3,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,3,1,1,3,3,3,3,3,0,3,3,3,2,3,3,3,2,2,3,3,3,3,3],
        [2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,0,2,2,2,1,2]
    ];
    // 更新第几期
    const _n = (await randSort(_nn[stopbet]))[1];
    // 
    let _this = _fou[_n];
    //
    const { p, peroids } = _this||{};
    if(!p || Object.keys(p).length<=0) return;
    // 
    let __p = {};
    for(let i in p)
    {
        let _pi = p[i];
        __p[i] = {};
        for(let j in _pi)
        {
            __p[i][j] = await rankMoney(_pi[j], i, j);
        }
    }
    _this['p'] = __p;
    //
    // console.log(JSON.stringify(_this));
    await redis_lottery_lset(lottery_fou_fix+category, _n, JSON.stringify(_this));
    // await sendToPage({
    //     peroids,
    //     data: __p
    // });
}
// 
// const sendToPage = async(d) => 
// {
//     let data = {};
//     let qun = {};
//     // 
//     for(let a in d.data)
//     {
//         // 经典投注
//         for(let b in d.data[a])
//         {
//             data[a+''+b] = [ d.peroids, d.data[a][b] ];
//         }
//         qun = await qunRank(a, d.peroids);
//     }
//     // {
//     //     jnd11: { '2754569': [ 3327101, 16, 0 ] },
//     //     jnd16: { '2754569': [ 1106628, 14, 0 ] },
//     //     jnd28: { '2754569': [ 13346738, 9, 0 ] },
//     //     jnd36: { '2754569': [ 2594933, 7, 0 ] },
//     //     jnd28gd: { '2754569': [ 3805827, 7, 0 ] },
//     //     pk10: { '2754569': [ 584686, 3, 0 ] },
//     //     pk22: { '2754569': [ 1326654, 7, 0 ] },
//     //     pksc: { '2754569': [ 9827325, 11, 0 ] },
//     //     pkgyh: { '2754569': [ 5373852, 7, 0 ] },
//     //     pkgj: { '2754569': [ 1956897, 13, 0 ] },
//     //     pklh: { '2754569': [ 343812, 6, 0 ] }
//     // }
//     // await redis_sd28_pub('sd28-site-room', JSON.stringify({
//     //     controller: 'game_automan_bet_update',
//     //     data
//     // }));
//     // if(qun)
//     // {
//     //     await redis_sd28_pub('sd28-site-room', JSON.stringify({
//     //         controller: 'game_qun_auto_bet_show',
//     //         ...qun
//     //     }));
//     // }
// }
// 群随机发送
// const qunRank = async(type, peroids) => 
// {
//     // 
//     const category = (await randSort(['q214','q28','q214','q28']))[1];
//     // 
//     // 昵称
//     let _man = await redis_sd28_auto_get('gameAutoMan');
//     _man = (await randSort(_man))[20];
//     // 
//     const _ty = (await randSort([1,2,3,4,5,6]))[1];
//     if(_ty>4)
//     {
//         return {
//             game: category+''+type,
//             data: [ 3, _man ]
//         }
//     }
//     // 
//     const __gqbs_name = 'GameQunBetShow'+category+''+type;
//     const _len = await redis_sd28_llen(__gqbs_name);
//     const __ran = await twoNumberRandom(0, _len);
//     let _index =  await redis_sd28_lindex(__gqbs_name, __ran);
//     //
//     if(!_index) return '';
//     _index = JSON.parse(_index);
//     // 
//     return {
//         game: category+''+type,
//         data: [
//             1,
//             dayjs().subtract((await randSort([1,2,3,4]))[1], 'second').format('HH:mm:ss'),
//             _man,
//             peroids,
//             ..._index
//         ]
//     }
// }
// 
const rankMoney = async(a, i, j) => 
{
    const _n = (await randSort([1,2,3,4,5,6,7,8,9]))[0];
    if(_n<5) return a;
    // 
    const dous = [100,800,500,102,3000,600,170,150,260,166,178,192,450,325,786,1329,1100,1500,3000,166,100,800,500,102,3000,600,170,1500,260,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,1000,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,20000,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,3000,2000,1500,300,166,100,800,500,102,3000,600,170,178,192,450,325,786,150,260,4000,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,1500,300,166,5600,100,800,500,102,3000,600,170,150,260,1100,25000,1500,300,166,8800,100,800,500,102,3000,600,170,150,260,5000,1100,1500,300,166,100,800,500,102,3000,600,170,150,260,1100,1500,300,166,1000,100,800,500,102,3000,600,170,150,260,1100,1500,300,166,5000,178,192,450,325,786,1329];
    //
    const _d = (await randSort(dous))[21]; 
    const _m = parseInt(_d * 1000 * Math.random() * 6); //This controls the amount of money in PHB
    // 
    return [
        parseInt( a[0] + parseInt(_m*odd[i][j]) ),
        parseInt( a[1] + (await rankBetNum(_m)) ),
        0
    ];
}
const rankBetNum = async(m) => 
{
    // return (await randSort([4,5,6,7,8]))[0];
    // if(m<300) return 1;
    return (await randSort(_bet_nums[0]))[0];
}
// 
schedule.scheduleJob('*/3 * * * * *', async() => 
{
    await getfou();
});