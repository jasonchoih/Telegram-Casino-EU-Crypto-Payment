// 
const { sequelize, QueryTypes, USERTELEGRAM } = require('../sequelize/db28');
const { async_get_telegram } = require('../plugin/redis');
const { deriveHDWallet } = require('../service/bot');
const { getAccountToken } = require('../service/crypto');
// const TronWeb = require('tronweb');
// 
const dTom = async(d) => 
{
    if(!d) return ['-']
    return [
        parseInt(d/1000),
        '$'
    ]
}
// 
const UserHdflType = async(d) => 
{
    const types = 
    {
        1: 'UserHdflScfl',
        2: 'UserHdflKsfl',
        3: 'UserHdflTzfl',
        4: 'UserHdflXxfl',
        5: 'UserHdflYgz'
    }
    // 
    let _n = {};
    for(let i in d)
    {
        const _di = d[i];
        _n[types[_di.type]] = _di.nums;
    }
    return _n
}
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
// const TotalData = async(d) => 
// {
//     const { 
//         AgentSum, 
//         UserSum, 
//         UserDou,
//         // 
//         UserPhb, 
//         UserExpDou, 
//         UserMrjj, 
//         UserMrqd, 
//         UserWdhb,
//         // 
//         UserHdflScfl,
//         UserHdflKsfl,
//         UserHdflTzfl,
//         UserHdflXxfl,
//         UserHdflYgz
//         // 
//     } = d || {};
//     // 
//     if(UserSum && AgentSum && UserDou)
//     {
//         const _user_sum_wins = -UserSum.wins;
//         const _game_wk = UserSum.bets-_user_sum_wins;
//         const _agent_rate = AgentSum.charge_rates+AgentSum.exchange_rates;
//         const _fls = await arrSum([
//             UserPhb.nums,UserExpDou.nums,UserMrjj.nums,UserMrqd.nums,UserWdhb.nums,
//             UserHdflScfl,UserHdflKsfl,UserHdflTzfl,UserHdflXxfl,UserHdflYgz
//         ]);
//         return [
//             [
//                 'Overall',
//                 [
//                     ['Game', ...await dTom(_game_wk) ],
//                     ['Card', ...await dTom(UserSum.exchange_rates) ],
//                     ['Agent', ...await dTom(-(_agent_rate)) ],
//                     ['Promo', ...await dTom(-_fls)],
//                     ['Total', ...await dTom((_game_wk+UserSum.exchange_rates)-_agent_rate-_fls) ],
//                 ]
//             ],
//             [
//                 'Member',
//                 [
//                     ['Bean', UserDou.dous],
//                     ['Bank', UserDou.banks],
//                     ['Total Bean', ...await dTom(UserDou.dous+UserDou.banks) ],
//                     ['Game Bets', ...await dTom(UserSum.bets) ],
//                     ['Game Won', ...await dTom(UserSum.wins) ],
//                 ]
//             ],
//             [
//                 'Card',
//                 [
//                     ['Charge', AgentSum.charge_nums, 'x' ],
//                     ['Exchange', UserSum.exchange_nums, '张' ],
//                     ['Return', AgentSum.exchange_nums, '张' ],
//                     ['Exchange', UserSum.exchanges, '$' ],
//                     ['Fee', UserSum.exchange_rates ],
//                 ]
//             ],
//             [
//                 'Agent',
//                 [
//                     ['Charge', ...await dTom(AgentSum.charges) ],
//                     ['Fee', ...await dTom(AgentSum.charge_rates) ],
//                     ['Total ', AgentSum.exchanges, '$' ],
//                     ['Return', ...await dTom(AgentSum.exchange_rates) ],
//                     ['Total', ...await dTom(AgentSum.charge_rates+AgentSum.exchange_rates) ],
//                 ]
//             ],
//             [
//                 'Daily',
//                 [
//                     ['Rank', UserPhb.nums ],
//                     ['Experience', UserExpDou.nums ],
//                     ['Emergency', UserMrjj.nums ],
//                     ['VIP', UserMrqd.nums ],
//                     ['Red Pocket', ...await dTom(UserWdhb.nums) ],
//                 ]
//             ],
//             [
//                 'Promo',
//                 [
//                     ['Charge', UserHdflScfl ],
//                     ['Loss', UserHdflKsfl ],
//                     ['Bet', UserHdflTzfl ], 
//                     ['Offline', UserHdflXxfl ],
//                     ['Total', ...await dTom(await arrSum([UserHdflScfl,UserHdflKsfl,UserHdflTzfl,UserHdflXxfl,UserHdflYgz])) ],
//                 ]
//             ]
//         ];
//     }
//     return '';
// }
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
            [
                ["Bet", ...await dTom(_user_sum_wins)],
                ["Bet in", ...await dTom(UserSum.bets)],
                ["Charge Q", AgentSum.charge_nums, 'x'],
                ["Charge", AgentSum.charges, '$'],
                ["Leaderboard", ...await dTom(UserPhb.nums)],
                ["First Charge", ...await dTom(UserHdflScfl)]
            ],[
                ["Exchange", ...await dTom(UserSum.exchange_rates)],
                ["Bet Win", ...await dTom(UserSum.win_dous)],
                ["Exchange Q", UserSum.exchange_nums, 'x'],
                ["Charge Royalty", ...await dTom(AgentSum.charge_rates)],
                ["Experience", ...await dTom(UserExpDou.nums)],
                ["Loss", ...await dTom(UserHdflKsfl)]
            ],[
                ["Royalty", ...await dTom(-(_agent_rate))],
                ["Beans", ...await dTom(UserDou.dous), '$'],
                ["Withdrawal Q", AgentSum.exchange_nums, 'x'],
                ["Withdrawal", AgentSum.exchanges, '$'],
                ["Emergency",...await dTom(UserMrjj.nums)],
                ["Bet", ...await dTom(UserHdflTzfl)]
            ],[
                ["Rebate/Promo", ...await dTom(-_fls)],
                ["Bank", ...await dTom(UserDou.banks), ' $'],
                ["Exchange", UserSum.exchanges, '$'],
                ["Withdrawal Royalty", ...await dTom(AgentSum.exchange_rates)],
                ["VIP", ...await dTom(UserMrqd.nums)],
                ["Referral", ...await dTom(UserHdflXxfl)]
            ],[
                ["Profit", ...await dTom((_user_sum_wins+UserSum.exchange_rates)-_agent_rate-_fls)],
                ['Agent', ...await dTom(AgentDou.dous), ' '],
                ["Fee", ...await dTom(UserSum.exchange_rates)],
                ["Agent Profit", ...await dTom(AgentSum.charge_rates+AgentSum.exchange_rates)],
                ["Red Pocket", ...await dTom(UserWdhb.nums)],
                ["Monthly Salary", ...await dTom(UserHdflYgz)]
            ],[
                ['Tokens', await tokenSum(), '$'],
                ['-', '-'],
                ['-', '-'],
                ['-', '-'],
                ['-', '-'],
                ["Total", ...await dTom(await arrSum([UserHdflScfl,UserHdflKsfl,UserHdflTzfl,UserHdflXxfl,UserHdflYgz]))]
            ]
        ];
    }
    return '';
}
// 
const BetData = async(d) => 
{
    const { TotalGameBet } = d;
    //
    if(TotalGameBet)
    {
        let _arr = [[['jnd11',0,11],['pksc',0,'SC'],['jnc11',0,11],['bj11',0,11],['dd11',0,11],['elg11',0,11],['slfk11',0,11],['au11',0,11],['kr11',0,11],['btc11',0,11]],[['jnd16',0,16],['pkgyh',0,'GYH'],['jnc16',0,16],['bj16',0,16],['dd16',0,16],['elg16',0,16],['slfk16',0,16],['au16',0,16],['kr16',0,16],['btc16',0,16]],[['jnd28',0,28],['pk10',0,'10'],['jnc28',0,28],['bj28',0,28],['dd28',0,28],['elg28',0,28],['slfk28',0,28],['au28',0,28],['kr28',0,28],['btc28',0,28]],[['jnd36',0,36],['pk22',0,'22'],['jnc36',0,36],['bj36',0,36],['dd36',0,36],['elg36',0,36],['slfk36',0,36],['au36',0,36],['kr36',0,36],['btc36',0,36]],[['jnd28gd',0,'28gd'],['pkgj',0,'GJ'],['jnc28gd',0,'28gd'],['bj28gd',0,'28gd'],['dd28gd',0,'28gd'],['elg28gd',0,'28gd'],['slfk28gd',0,'28gd'],['au28gd',0,'28gd'],['kr28gd',0,'28gd'],['btc28gd',0,'28gd']],[['q214jnd',0,'2.14'],['pklh',0,'LH'],['q214jnc',0,'2.14'],['q214bj',0,'2.14'],['q214dd',0,'2.14'],['q214elg',0,'2.14'],['q214slfk',0,'2.14'],['q214au',0,'2.14'],['q214kr',0,'2.14'],['q214btc',0,'2.14']],[['q28jnd',0,'2.8'],['q214pk',0,'2.14'],['q28jnc',0,'2.8'],['q28bj',0,'2.8'],['q28dd',0,'2.8'],['q28elg',0,'2.8'],['q28slfk',0,'2.8'],['q28au',0,'2.8'],['q28kr',0,'2.8'],['q28btc',0,'2.8']],[['Total',0],['Total',0],['Total',0],['Total',0],['Total',0],['Total',0],['Total',0],['Total',0],['Total',0],['Total',0]]];
        //
        let _g = {};
        for(let i in TotalGameBet)
        {
            const tgbi = TotalGameBet[i];
            _g[tgbi.category+''+tgbi.type] = tgbi.wins;
        }
        for(let i in _arr)
        {
            for(let j in _arr[i])
            {
                const _ijn = _arr[i][j][0];
                if(_g[_ijn])
                {
                    _arr[i][j][0] = _arr[i][j][2];
                    _arr[i][j][1] = -parseInt(_g[_ijn]/1000);
                    _arr[i][j][2] = '$'; 
                    //
                    _arr[7][j][1] += _arr[i][j][1];
                    _arr[7][j][2] = '$';
                }else{
                    if(i!=7) _arr[i][j] = [0,0];
                }
            }
        }
        return _arr;
    }
    return '';
}
// 
module.exports = {
    UserHdflType,
    // 
    // TotalData, 
    SumData,
    BetData
}