//
const dayjs = require('dayjs'); 
const { sequelize,QueryTypes,USERS,USERBET,USERCARD,AGENTCARD,AGENTCHARGE,PAGEREQUEST,PAGEVIEW,USERSUM,AGENTSUM, USERTRANSACTION, AGENTTRANSACTION } = require('../sequelize/db28');
const { getUsersNick, getAgentsNick } = require('../service/user');
const { get_1_List_last_one, get_1, get_2,set_2, 
    // redis_aws_kill_set 
} = require('../plugin/redis');
// 
const GameBets = async() => 
{
    const rows = await USERBET.findAll({limit:20,order:[['id','DESC']]});
    const usernicks = await getUsersNick(rows);
    let GameBets = [];
    for(let i in rows)
    {
        let _v = rows[i];
        GameBets.push([
            dayjs(_v.time).format('MM-DD HH:mm:ss'),
            _v.mode,
            _v.user_id,
            usernicks[_v.user_id]||'-',
            _v.category+'/'+_v.type,
            _v.peroids,
            JSON.parse(_v.vals),
            _v.dou
        ])
    }
    return { GameBets }
}
//
const OpenLotterys = async() => 
{
    const rows = await USERBET.findAll({where:{status:2},limit:20,order:[['id','DESC']]});
    const usernicks = await getUsersNick(rows);
    let OpenLotterys = [];
    for(let i in rows)
    {
        let _v = rows[i];
        OpenLotterys.push([
            _v.mode,
            dayjs(_v.time).format('MM-DD HH:mm:ss'),
            _v.user_id,
            usernicks[_v.user_id]||'-',
            _v.category+'/'+_v.type,
            _v.peroids,
            Object.keys(JSON.parse(_v.vals)).length,
            _v.dou,
            _v.win_dou,
            JSON.parse(_v.wins)
        ])
    }
    return { OpenLotterys }
}
//
const AgentCharges = async() => 
{
    const rows = await AGENTCHARGE.findAll({limit:20,order:[['id','DESC']]});
    let AgentCharges = [];
    for(let i in rows)
    {
        let _v = rows[i];
        AgentCharges.push([
            dayjs(_v.time).format('MM-DD HH:mm:ss'),
            _v.agent_id,
            _v.agent_nick,
            _v.money,
            _v.user_id,
            _v.user_nick,
            _v.status
        ])
    }
    return { AgentCharges }
}
//
const KamiDuihuangs = async() => 
{
    const rows = await USERCARD.findAll({limit:20,order:[['id','DESC']]});
    const usernicks = await getUsersNick(rows);
    let KamiDuihuangs = [];
    for(let i in rows)
    {
        let _v = rows[i];
        KamiDuihuangs.push([
            dayjs(_v.time).format('MM-DD HH:mm:ss'),
            _v.user_id,
            usernicks[_v.user_id]||'-',
            _v.km,
            _v.status,
            _v.id,
            _v.money,
            _v.name
        ])
    }
    return { KamiDuihuangs }
}
//
const KamiHuoshous = async() => 
{
    const rows = await AGENTCARD.findAll({limit:20,order:[['id','DESC']]});
    const agentnicks = await getAgentsNick(rows);
    let KamiHuoshous = [];
    for(let i in rows)
    {
        let _v = rows[i];
        KamiHuoshous.push([
            dayjs(_v.time).format('MM-DD HH:mm:ss'),
            agentnicks[_v.agent_id]||'-',
            _v.km,
            _v.user_id,
            _v.user_name,
            _v.money
        ])
    }
    return { KamiHuoshous }
}
//
const PageViews = async() => // TRX IN
{
    const rows = await USERTRANSACTION.findAll({limit:20,order:[['id','DESC']]});
    const usernicks = await getUsersNick(rows);
    let PageViews = [];
    for(let i in rows)
    {
        let _v = rows[i];
        PageViews.push([
            _v.user_id,
            usernicks[ _v.user_id] || '-',
            _v.address_business,
            _v.amount,
            _v.transaction_id,
            dayjs(_v.time).format('MM-DD HH:mm:ss')
        ])
    }
    return { PageViews }
}
//
const PageRequests = async() =>  // TRX OUT
{
    const rows = await AGENTTRANSACTION.findAll({limit:20,order:[['id','DESC']]});
    const usernicks = await getUsersNick(rows);
    let PageRequests = [];
    for(let i in rows)
    {
        let _v = rows[i];
        PageRequests.push([
            _v.address_agent,
            _v.address_customer,
            _v.amount,
            _v.transaction_id,
            dayjs(_v.time).format('MM-DD HH:mm:ss')
        ])
    }
    return { PageRequests }
}
// const PageViews = async() => 
// {
//     const rows = await PAGEVIEW.findAll({limit:20,order:[['id','DESC']]});
//     let PageViews = [];
//     for(let i in rows)
//     {
//         let _v = rows[i];
//         PageViews.push([
//             _v.user_id,
//             _v.user_nick,
//             _v.path,
//             _v.ip,
//             dayjs(_v.time).format('MM-DD HH:mm:ss')
//         ])
//     }
//     return { PageViews }
// }
// //
// const PageRequests = async() => 
// {
//     const rows = await PAGEREQUEST.findAll({limit:20,order:[['id','DESC']]});
//     let PageRequests = [];
//     for(let i in rows)
//     {
//         let _v = rows[i];
//         PageRequests.push([
//             _v.origin,
//             _v.agent,
//             dayjs(_v.time).format('MM-DD HH:mm:ss'),
//             _v.ip,
//             _v.port,
//         ])
//     }
//     return { PageRequests }
// }
// 
const auSum = async() => 
{
    const time = dayjs().format('YYYY-MM-DD');
    // 
    const AgentSum = await sequelize.query('SELECT '+
    'sum(charge) as agent_charges,'+
    'sum(exchange) as agent_exchanges '+
    " FROM agent_day_data WHERE time = '"+time+"' ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 
    const UserSum = await sequelize.query('SELECT '+
    'sum(bet) as user_bets,'+
    'sum(win) as user_wins,'+
    'sum(exchange) as user_exchanges '+
    " FROM user_day_data WHERE time = '"+time+"' ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 
    return {
        HomeNowSum:{
            agent_charges: AgentSum.agent_charges||0,
            agent_exchanges: AgentSum.agent_exchanges||0,
            user_bets: UserSum.user_bets||0,
            user_wins: UserSum.user_wins||0,
            user_exchanges: UserSum.user_exchanges||0,
        }
    }
}
// 
const LotteryNew = async(d) => 
{
    // 
    const games = [
        'jnd',
        'ddbj',
        'jnc',
        'elg',
        'slfk',
        'au',
        'btc','kr'
    ];
    let LotteryNew = {};
    for(let i in games)
    {
        const gamei = games[i];
        const gamed = await get_1_List_last_one(gamei);
        const ii = gamei=='ddbj'?'bj':gamei;
        // 
        let _game_l = '';
        if(gamed[ii])
        {
            _game_l = {};
            for(let j in gamed[ii])
            {
                if([11,16,28,36].find(v=>v==j)) _game_l[j] = gamed[ii][j][1];
            }
        }
        // 
        LotteryNew[gamei] = [
            gamed.peroids,
            gamed.time,
            _game_l
        ]
    }
    // const LotteryNewCaomei = await get_1('lottery_caomei_new_data');
    return { LotteryNew }
}
//
const Settings = async() => 
{
    const _arr = ['KillBtc','KillKr','KillAu'];
    let Settings = {};
    for(let i in _arr)
    {
        const _n = _arr[i];
        Settings[_n] = await get_2(_n);
    }
    //
    return { Settings }
}
//
const now = async(d) => 
{
    return {
        ...await GameBets(),
        ...await OpenLotterys(),
        ...await AgentCharges(),
        ...await KamiHuoshous(),
        ...await PageViews(),
        ...await PageRequests(),
        ...await KamiDuihuangs(),
        ...await auSum(),
        ...await LotteryNew(),
        ...await Settings()
    }
}
// 
const killset = async(d) => 
{
    const { category } = d;
    const categorys = {
        'au' : ['KillAu', 'auKillLoading' ],
        'kr' : ['KillKr', 'btcKillLoading' ],
        'btc': ['KillBtc', 'krKillLoading' ]
    };
    // 
    if(!category || !categorys[category])
    {
        _r[_c[1]] = '';
        _r['M'] = { c:'设置错误，请检查！' };
        return _r;
    }
    let _r = {};
    const _c = categorys[category];
    // 
    let _g = await get_2(_c[0]);
    _g['autokill'] = _g['autokill']=='1'?'2':'1';
    await set_2(_c[0], _g);
    // 
    _r[_c[1]] = '';
    _r['Settings'] = {};
    // 
    for(let i in categorys)
    {
        if(i==category)
        {
            _r['Settings'][_c[0]] = _g;
        }else{
            _r['Settings'][categorys[i][0]] = await get_2(categorys[i][0]);
        }
    }
    //
    let _is_ok = 1;
    try {
        // _is_ok = await redis_aws_kill_lpush('au_kr_btc_kill_lists', JSON.stringify({
        //     mode: 'setting_'+category,
        //     data: _g
        // }));
        _is_ok = await redis_aws_kill_set('set_kill_'+category, JSON.stringify(_g));
    } catch (error) {
        
    }
    if(!_is_ok) return { M:{c:'设置失败，请重试！'} };
    // 
    return _r;
}
// 
module.exports = {
    now,
    GameBets,
    OpenLotterys,
    AgentCharges,
    KamiDuihuangs,
    KamiHuoshous,
    PageViews,
    PageRequests,
    // 
    auSum,
    killset
};