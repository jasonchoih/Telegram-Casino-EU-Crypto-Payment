//
const dayjs = require('dayjs'); 
const { sequelize, QueryTypes } = require('../sequelize/db28');
const { TotalData, BetData, UserHdflType } = require('../service/totalData');
// 
const arrSum = async(d) => 
{
    if(d.length<=0) return 0;
    let _n = 0;
    for(let i in d)
    {
        if(d[i]) _n+=parseInt(d[i]);
    }
    return _n;
}
// 
const dTom = async(d) => 
{
    if(!d) return ['0']
    return [
        parseInt(d/1000),
        '$'
    ]
}
// 
const SumData = async(d) => 
{
    const { 
        AgentSum, 
        UserSum, 
        // 
        UserPhb, 
        UserExpDou, 
        UserMrjj, 
        UserMrqd, 
        UserWdhb,
        // 
        UserHdflScfl,
        UserHdflKsfl,
        UserHdflTzfl,
        UserHdflXxfl,
        UserHdflYgz
        // 
    } = d || {};
    // 
    const UserDou = await sequelize.query('SELECT '+
    'sum(dou) as dous,'+
    'sum(bank) as banks'+
    " FROM user_data a LEFT JOIN users b ON a.user_id=b.id where b.cs=1 ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    const AgentDou = await sequelize.query('SELECT '+
    'sum(dou) as dous '+
    " FROM agent a LEFT JOIN users b ON a.agent_id=b.id where b.status=1 ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    const QMembers = await sequelize.query(`SELECT COUNT(*) as count FROM users
    WHERE cs=1 and role=1 and status=1`, 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 
    const members = QMembers.count;
    // 
    const QAgents = await sequelize.query(`SELECT COUNT(*) as count FROM users u join agent a on u.id = a.agent_id
    WHERE u.cs=1 and u.status=1`, 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 
    const Agents = QAgents.count;
    // 
    if(UserSum && AgentSum)
    {
        const _user_sum_wins = -UserSum.wins;
        const _game_wk = UserSum.bets-_user_sum_wins;
        const _agent_rate = AgentSum.charge_rates+AgentSum.exchange_rates;
        const _fls = await arrSum([
            UserPhb.nums,UserExpDou.nums,UserMrjj.nums,UserMrqd.nums,UserWdhb.nums,
            UserHdflScfl,UserHdflKsfl,UserHdflTzfl,UserHdflXxfl,UserHdflYgz
        ]);
        return [
            // [
            //     ["Game", ...await dTom(_user_sum_wins)],
            //     ["Bet", ...await dTom(UserSum.bets)],
            //     ["Charge Quantity", AgentSum.charge_nums, 'x'],
            //     ["Amount", AgentSum.charges, '$'],
            //     ["Rank", UserPhb.nums],
            //     ["First Charge", ...await dTom(UserHdflScfl)]
            // ],[
            //     ["Card", ...await dTom(UserSum.exchange_rates)],
            //     ["Game Win", ...await dTom(UserSum.win_dous)],
            //     ["Exch. Quantity", UserSum.exchange_nums, 'x'],
            //     ["Charge comm.", ...await dTom(AgentSum.charge_rates)],
            //     ["Experience", UserExpDou.nums],
            //     ["Loss Promo", ...await dTom(UserHdflKsfl)]
            // ],[
            //     ["Agent comm.", ...await dTom(-(_agent_rate))],
            //     ["Beans", ...await dTom(UserDou.dous), ' 豆'],
            //     ["Return Quantity", AgentSum.exchange_nums, 'x'],
            //     ["Return Amount", AgentSum.exchanges, '$'],
            //     ["Emergency", UserMrjj.nums],
            //     ["Bet Promo", ...await dTom(UserHdflTzfl)]
            // ],[
            //     ["Promotions", ...await dTom(-_fls)],
            //     ["Bank", ...await dTom(UserDou.banks), ' 豆'],
            //     ["Exch. Amount", UserSum.exchanges, '$'],
            //     ["Return comm.", ...await dTom(AgentSum.exchange_rates)],
            //     ["VIP", ...await dTom(UserMrqd.nums)],
            //     ["Offline", ...await dTom(UserHdflXxfl)]
            // ],[
            //     ["Profit", ...await dTom((_user_sum_wins+UserSum.exchange_rates)-_agent_rate-_fls)],
            //     ['Agent', ...await dTom(AgentDou.dous), ' 豆'],
            //     ["Exch. Fee", ...await dTom(UserSum.exchange_rates)],
            //     ["Agent Profit", ...await dTom(AgentSum.charge_rates+AgentSum.exchange_rates)],
            //     ["Red Pocket", ...await dTom(UserWdhb.nums)],
            //     ["Monthly Salary", ...await dTom(UserHdflYgz)]
            // ],[
            //     ['-', '-'],
            //     ['-', '-'],
            //     ['-', '-'],
            //     ['-', '-'],
            //     ['-', '-'],
            //     ["Total", ...await dTom(await arrSum([UserHdflScfl,UserHdflKsfl,UserHdflTzfl,UserHdflXxfl,UserHdflYgz]))]
            // ],
                [
                    [
                        "Загальний заробіток", 
                        ...await dTom((_user_sum_wins+UserSum.exchange_rates)-_agent_rate-_fls) || 0
                    ],
                ],
                [
                    ["Ігрові ставки", ...await dTom(_user_sum_wins)],
                    ["Обмін картками", ...await dTom(UserSum.exchange_rates)],
                    ["Агентський продаж", AgentSum.charges, '$'],
                    ["Промо", ...await dTom(-_fls)]
                ],
                [
                    ['Члени', members],
                    ['Агенти', Agents]
                ]
        ];
    }
    return '';
}
// 
const daySum = async(d) => 
{
    const { type, time } = d;
    // 
    const AgentSum = await sequelize.query('SELECT '+
    'DATE_FORMAT(time,"'+type+'") as times,'+
    'sum(charge_num) as charge_nums,'+
    'sum(charge) as charges,'+
    'sum(charge_rate) as charge_rates,'+
    'sum(exchange) as exchanges,'+
    'sum(exchange_num) as exchange_nums,'+
    'sum(exchange_rate) as exchange_rates,'+
    'sum(rate_sum) as rate_sums'+
    " FROM agent_day_data WHERE time like '"+time+"%' ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 
    const UserSum = await sequelize.query('SELECT '+
    'DATE_FORMAT(a.time,"'+type+'") as times,'+
    'sum(a.bet) as bets,'+
    'sum(a.win_dou) as win_dous,'+
    'sum(a.win) as wins,'+
    'sum(a.charge) as charges,'+
    // 'sum(charge_num) as charge_nums,'+
    'sum(a.exchange) as exchanges,'+
    'sum(a.exchange_num) as exchange_nums,'+
    'sum(a.exchange_rate) as exchange_rates'+
    " FROM user_day_data a LEFT JOIN users b ON a.user_id=b.id WHERE b.cs=1 and a.time like '"+time+"%' ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 排行榜
    const UserPhb = await sequelize.query('SELECT '+
    'DATE_FORMAT(time,"'+type+'") as times,'+
    'sum(num) as nums'+
    " FROM user_phb WHERE status=2 and time like '"+time+"%' ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 经验换豆
    const UserExpDou = await sequelize.query('SELECT '+
    'DATE_FORMAT(time,"'+type+'") as times,'+
    'sum(num) as nums'+
    " FROM user_exp_dou WHERE time like '"+time+"%' ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 每日签到
    const UserMrjj = await sequelize.query('SELECT '+
    'DATE_FORMAT(time,"'+type+'") as times,'+
    'sum(num) as nums'+
    " FROM user_mrjj WHERE time like '"+time+"%' ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 每日救济
    const UserMrqd = await sequelize.query('SELECT '+
    'DATE_FORMAT(time,"'+type+'") as times,'+
    'sum(num) as nums'+
    " FROM user_mrqd WHERE time like '"+time+"%' ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 红包领取
    const UserWdhb = await sequelize.query('SELECT '+
    'DATE_FORMAT(a.time,"'+type+'") as times,'+
    'sum(a.num) as nums'+
    " FROM user_wdhb a LEFT JOIN users b ON a.user_id=b.id WHERE b.cs=1 and a.time like '"+time+"%' ", 
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 首充返利 - 亏损返利 - 投注返利 - 下线返利 - 月工资
    const UserHdfl = await sequelize.query('SELECT '+
    'DATE_FORMAT(time,"'+type+'") as times,'+
    'sum(num) as nums, type'+
    " FROM user_hdfl WHERE time like '"+time+"%' GROUP BY type ", 
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    // 
    return { 
        AgentSum,
        UserSum,
        // 
        UserPhb, 
        UserExpDou, 
        UserMrjj, 
        UserMrqd, 
        UserWdhb,
        ...await UserHdflType(UserHdfl)
    }
}
// 
// const TotalGameBet = async(d) => 
// {
//     const { type, time } = d;
//     // 游戏投注
//     const TotalGameBet = await sequelize.query('SELECT '+
//     'DATE_FORMAT(a.time,"'+type+'") as times,'+
//     'sum(a.win) as wins, a.category,a.type '+
//     " FROM user_bet_data a LEFT JOIN users b ON a.user_id=b.id and b.cs=1 WHERE a.time like '"+time+"%' GROUP BY a.category,a.type ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: false,
//     });
//     // 
//     return { TotalGameBet };
// }
// 
const month = async(d) => 
{
    const { month } = d;
    //
    const type = '%Y-%m';
    const time = month;
    //
    return {
        TotalSum: await SumData(await daySum({type,time})),
        // TotalBet: await BetData(await TotalGameBet({type,time})),
        TotalLoading:false,
    }
}
// 
const day = async(d) => 
{
    const { day } = d;
    //
    const type = '%Y-%m-%d';
    const time = day;
    //
    return {
        TotalSum: await SumData(await daySum({type,time})),
        // TotalBet: await BetData(await TotalGameBet({type,time})),
        TotalLoading:false,
    }
}
const daya = async() => await day({ day: dayjs().format('YYYY-MM-DD') });
const dayb = async() => await day({ day: dayjs().subtract(1, 'day').format('YYYY-MM-DD') });
const montha = async() => await month({ month: dayjs().format('YYYY-MM') });
//
const all = async(d) => 
{
    const type = '%Y-%m-%d';
    const time = dayjs().format('YYYY-MM-DD')+'';
    // 
    return {
        // TotalSum: await TotalData(await allSum()),
        TotalSum: await SumData(await daySum({type,time})), 
        // TotalBet: await BetData(await TotalGameBet({type,time})),
        TotalLoading:false,
    }
}
// 
module.exports = {
    all,
    day,
    month,
    daya,
    dayb,
    montha
};