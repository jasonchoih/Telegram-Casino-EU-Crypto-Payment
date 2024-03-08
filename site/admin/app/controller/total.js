//
const dayjs = require('dayjs'); 
const { 
    sequelize, QueryTypes, 
} = require('../sequelize/db28');
const { 
    // TotalData, 
    SumData, BetData, UserHdflType 
} = require('../service/totalData');
// 
// const allSum = async() => 
// {
//     const AgentSum = await sequelize.query('SELECT '+
//     'sum(charge_num) as charge_nums,'+
//     'sum(charge) as charges,'+
//     'sum(charge_rate) as charge_rates,'+
//     'sum(exchange) as exchanges,'+
//     'sum(exchange_num) as exchange_nums,'+
//     'sum(exchange_rate) as exchange_rates,'+
//     'sum(rate_sum) as rate_sums'+
//     " FROM agent_sum ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: true,
//     });
//     // 
//     const UserSum = await sequelize.query('SELECT '+
//     'sum(bet) as bets,'+
//     'sum(win) as wins,'+
//     'sum(charge) as charges,'+
//     // 'sum(charge_num) as charge_nums,'+
//     'sum(exchange) as exchanges,'+
//     'sum(exchange_num) as exchange_nums,'+
//     'sum(exchange_rate) as exchange_rates'+
//     " FROM user_sum ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: true,
//     });
//     // 
//     const UserDou = await sequelize.query('SELECT '+
//     'sum(dou) as dous,'+
//     'sum(bank) as banks'+
//     " FROM user_data ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: true,
//     });
//     // 排行榜
//     const UserPhb = await sequelize.query('SELECT '+
//     'sum(num) as nums'+
//     " FROM user_phb WHERE status=2 ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: true,
//     });
//     // 经验换豆
//     const UserExpDou = await sequelize.query('SELECT '+
//     'sum(num) as nums'+
//     " FROM user_exp_dou ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: true,
//     });
//     // 每日签到
//     const UserMrjj = await sequelize.query('SELECT '+
//     'sum(num) as nums'+
//     " FROM user_mrjj ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: true,
//     });
//     // 每日救济
//     const UserMrqd = await sequelize.query('SELECT '+
//     'sum(num) as nums'+
//     " FROM user_mrqd ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: true,
//     });
//     // 红包领取
//     const UserWdhb = await sequelize.query('SELECT '+
//     'sum(num) as nums'+
//     " FROM user_wdhb ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: true,
//     });
//     // 首充返利 - 亏损返利 - 投注返利 - 下线返利
//     const UserHdfl = await sequelize.query('SELECT '+
//     'sum(num) as nums, type'+
//     " FROM user_hdfl GROUP BY type ", 
//     {
//         type: QueryTypes.SELECT,
//         plain: false,
//     });
//     // 
//     return { 
//         AgentSum,
//         UserSum,
//         UserDou,
//         // 
//         UserPhb, 
//         UserExpDou, 
//         UserMrjj, 
//         UserMrqd, 
//         UserWdhb,
//         ...await UserHdflType(UserHdfl)
//     }
// }
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
const TotalGameBet = async(d) => 
{
    const { type, time } = d;
    // 游戏投注
    const TotalGameBet = await sequelize.query('SELECT '+
    'DATE_FORMAT(a.time,"'+type+'") as times,'+
    'sum(a.win) as wins, a.category,a.type '+
    " FROM user_bet_data a LEFT JOIN users b ON a.user_id=b.id and b.cs=1 WHERE a.time like '"+time+"%' GROUP BY a.category,a.type ", 
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    // 
    return { TotalGameBet };
}
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
        TotalBet: await BetData(await TotalGameBet({type,time})),
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
        TotalBet: await BetData(await TotalGameBet({type,time})),
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
        TotalBet: await BetData(await TotalGameBet({type,time})),
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