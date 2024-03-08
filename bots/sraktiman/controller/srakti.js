//
const dayjs = require('dayjs'); 
const { sequelize, QueryTypes, USERTELEGRAM } = require('../sequelize/db28');
const { UserHdflType } = require('../service/totalData');
const { async_get_telegram } = require('../plugin/redis');
const { getAccountToken } = require('../service/crypto');
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
const tokenSum = async() =>
{
    // =====================================================================================
    // TRONWEB (FREE)
    const { network, contract, trongrid_key } = await async_get_telegram("environment");
    let sum = 0;
    const rows = await USERTELEGRAM.findAll({});
    // for( let i in rows)
    // {
    //     const v = rows[i];
    //     const privateKey = (await deriveHDWallet(v.user_id)).substring(2);
    //     const tronWeb = new TronWeb({ 
    //         fullHost: network,
    //         privateKey,
    //         "TRON-PRO-API-KEY" : trongrid_key  || '' 
    //     });
    //     const { abi } = await tronWeb.trx.getContract(contract);
    //     const contract_abi = tronWeb.contract(abi.entrys, contract);
    //     const balance = await contract_abi.methods.balanceOf(v.address_business).call();
    //     // 
    //     sum+= parseInt(balance.toString())
    // }
    // return (sum/1_000_000).toFixed(2);
    // =====================================================================================
    // CRYPTO API (PAID)
    for( let i in rows)
    {
        const v = rows[i];
        // 
        const tokenBalance = await getAccountToken(v.address_business);
        if(tokenBalance.data.items.length>0){
            const { confirmedBalance } = tokenBalance.data.items[0];
            sum+= parseInt(confirmedBalance)
        }
    }
    return sum.toFixed(2);
    // =====================================================================================
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
    const QMembers = await sequelize.query(`SELECT COUNT(*) as count FROM users WHERE cs=1 and role=1 and status=1`, 
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
        return {
            'total_earning': ['Загальний заробіток', ...await dTom((_user_sum_wins+UserSum.exchange_rates)-_agent_rate-_fls) || 0],
            'game_bets': ['Ігрові ставки', ...await dTom(_user_sum_wins)], // ==> How much player betted
            // 'game_win': ["Bet Win", ...await dTom(UserSum.win_dous)],
            'fees': ["Комісія за обмін", ...await dTom(UserSum.exchange_rates)],
            // 'exchange': ['Сума обміну', ...await dTom(UserSum.exchange_rates)],
            'agent_charge': ['Агентський продаж', AgentSum.charges || 0],
            'promo': ['Промо', ...await dTom(-_fls) ],
            // 'members': ['Члени', members],
            // 'USDT': ['Баланс гаманця USDT', await tokenSum(), '$']
        }
    }
    return '';
}
// 
const getUSDTBalance = async() =>
{
    return await tokenSum();
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
const month = async(d) => 
{
    const { month } = d;
    //
    const type = '%Y-%m';
    const time = month;
    //
    return {
        ...await SumData(await daySum({type,time})),
        time
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
        ...await SumData(await daySum({type,time})),
        time: day
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
        TotalSum: await SumData(await daySum({type,time}))
    }
}
// 
module.exports = {
    all,
    day,
    month,
    daya,
    dayb,
    montha,
    getUSDTBalance
};