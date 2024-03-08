const dayjs = require("dayjs");
const { USERDATA, USERTELEGRAM, USERBET, USERDAYDATA, Op } = require('../sequelize/db28');
const { nTom } = require('../service/tool');
const { getHdfl } = require('../service/hdfl');
const { LsCheck } = require('../service/liushui');
// 
const check_dou = async(d) =>
{
    const { telegram_id } = d;
    // 
    const { user_id } = await USERTELEGRAM.findOne({
        attributes:['user_id'],
        where:{ telegram_id }
    })
    // 
    const { dou, bank } = await USERDATA.findOne({
        attributes:['dou'],
        where:{
            user_id
        }
    })
    return 'ID: ' + telegram_id + '\n\n' +
    '您的余额：' + nTom(dou || 0) + ' 金豆' 
    // '银行余额：' + nTom(bank || 0) + ' 金豆' 
}
// let [ ls, tip, odd, charge_dou, _user_data_last_charge_dou ] = await LsCheck({user_id:id});
/*
<p>兑换卡密：<span><b>{nTom(ShopTip.money)}</b> 元</span></p>
<p>兑换流水：<span>{nTom(ShopTip.ls)} 豆</span></p>
<p>当前充值：<span>{nTom(ShopTip.charge_dou)} 豆</span></p>
<p>充前余额：<span>{nTom(ShopTip.last)} 豆</span></p>
<p>兑换状态：<span>{ShopTip.tip}</span></p>
<p>需手续费：<span><b>{nTom(ShopTip.rate)}</b> %</span></p>
<p>卡密金豆：<span><b>{nTom(ShopTip.dou)}</b> 豆</span></p>
<p>兑换费率：<span><b>{nTom(ShopTip.douodd)}</b> 豆</span></p>
<p>金豆合计：<span><b>{nTom(ShopTip.dousum)}</b> 豆</span></p>
<p>银行金豆：<span>{nTom(ShopTip.bank)} 豆</span></p>
*/
const check_ls = async(d) =>
{
    const { telegram_id } = d;
    // 
    const { user_id } = await USERTELEGRAM.findOne({
        attributes:['user_id'],
        where:{ telegram_id }
    })
    // 
    const time = dayjs().format('YYYY-MM-DD');
    const { day_first_charge, bet, win } = await USERDAYDATA.findOne({attributes:['day_first_charge', 'bet', 'win'],where:{user_id, time}})
    // 
    const [ ls, tip, odd, charge_dou, _user_data_last_charge_dou ] = await LsCheck({user_id});
    // 
    const { UserHdfl, UserHdflSum } = await getHdfl({ user_id, yestoday: time })
    // 
    return 'ID: ' + telegram_id + '\n\n' +
    // '手续费' + '\n' +
    // '无流水：5%' + '\n' +
    // '流水小于1倍：3%' + '\n' +
    // '流水小于2倍：2%' + '\n' +
    // '流水小于3倍：1%' + '\n' +
    // '流水大于3倍：免手续费'+ '\n' +
    // '单日提现5次以上：1%' + '\n\n' +
    
    // "您的流水：" + nTom(ls) + " 金豆" + "\n" +
    // "当前充值：" + nTom(charge_dou) + " 金豆" + "\n" +
    // "充前余额：" + nTom(_user_data_last_charge_dou) + " 金豆" + "\n\n" +
    // tip + "\n"
    "今天流水：" + (nTom(ls) || 0)  + " 金豆"  + '\n' +

    "今天首充：" + (day_first_charge || 0) + ' 美元' + '\n' +
    "投注额：" + (nTom(bet) || 0) +' 金豆' + '\n' + 
    "盈亏：" + (nTom(win) || 0) + ' 金豆' + '\n\n' + 

    "明天记得领取返利哦！" + '\n' +
    "🔸首充返利：" + (nTom(UserHdfl['HdflScfl'] || 0) ) + ' 金豆' + '\n' +
    "🔸投注返利：" + (nTom(UserHdfl['HdflTzfl'] || 0) ) + ' 金豆' + '\n' +
    "🔸亏损返利：" + (nTom(UserHdfl['HdflKsfl'] || 0) ) + ' 金豆' + '\n'  +
    "🔸总数：" + (nTom(UserHdflSum) || 0) + ' 金豆';
}
// 
const check_dh = async(d) =>
{
    const { telegram_id } = d;
    // 
    const { user_id } = await USERTELEGRAM.findOne({
        attributes:['user_id'],
        where:{ telegram_id }
    })
    // 
    const [ ls, tip, odd, charge_dou, _user_data_last_charge_dou ] = await LsCheck({user_id});
    // 
    return 'ID: ' + telegram_id + '\n\n' +

    "您的流水：" + (nTom(ls) || 0) + " 金豆" + "\n" +
    "当前充值：" + (nTom(charge_dou) || 0) + " 金豆" + "\n" +
    "充前余额：" + (nTom(_user_data_last_charge_dou) || 0 )+ " 金豆" + "\n\n" +
    tip + "\n\n" +

    '手续费' + '\n' +
    '无流水：5%' + '\n' +
    '流水小于1倍：3%' + '\n' +
    '流水小于2倍：2%' + '\n' +
    '流水小于3倍：1%' + '\n' +
    '流水大于3倍：免手续费'+ '\n' +
    '单日提现5次以上：1%' 
    
}
// 
const check_jl = async(d) =>
{
    const { telegram_id, category } = d;
    const startOfToday = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endOfToday = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    // 
    const { user_id } = await USERTELEGRAM.findOne({
        attributes:['user_id'],
        where:{ telegram_id }
    })
    // 
    const _user_bets = await USERBET.findAll({
        attributes: ['time', 'peroids', 'telegram_chat', 'win_dou'],
        where:{
            user_id,
            category,
            type:{
                [Op.or]: category =='pk' ? ['sc'] :[28, 36]
            },
            time: {
                [Op.between]: [startOfToday, endOfToday]
            }
        },
        order: [['time']],
        limit: 3
    });
        // 
    let re = "期号              下注          中奖";
    for(let i in _user_bets){
        const v = _user_bets[i];
        const { text } = JSON.parse(v.telegram_chat);
        // 
        re += "\n" + v.peroids + "      " + text + "        " + (nTom(v.win_dou) || 0) + " 金豆";
    }
    return 'ID: ' + telegram_id + '\n\n' + re
}
// 
module.exports={
    check_dou,
    check_ls,
    check_jl,
    check_dh
}