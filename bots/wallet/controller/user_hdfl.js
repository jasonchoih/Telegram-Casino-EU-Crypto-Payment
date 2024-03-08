const dayjs = require('dayjs');
const { get_2, SubDo } = require('../plugin/redis');
const { mTon, nTom } = require('../utils/tool');
const { getHdfl } = require('../service/hdfl');
const { USERTELEGRAM, USERDAYDATA, USERS } = require('../sequelize/db28');
// 
const timeCheck = async(d) => 
{
    const { start_time, end_time } = d;
    // 
    const _start = dayjs(start_time).diff(dayjs(),'second');
    if(_start>0) return '<b>未开始</b>';
    //
    const _end = dayjs(end_time).diff(dayjs(),'second');
    if(_end<=0) return '<b>已结束</b>';
    //
    return '进行中';
}
//
const activy_table = async(d,odd,pix)=>
{
    let _r = '';
    for(let i in d)
    {
        let _di = d[i];
        _r+=  "    " + _di['ls'] +(odd||'') + '<b>' + _di['odd']+(pix||'') + '</b>' + '\n'
        // 1倍<b>1%</b>
    }
    return _r;
}
// 
const hdflBoard = async(d) =>
{
    const { telegram_id, message_id } = d;
    // 
    const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'], where:{telegram_id}}); 
    const { cs, status, uuid } = await USERS.findOne({ attributes: ['uuid', 'cs', 'status'], where:{id:user_id} });
    if(cs=='2' || status!=1) return;
    // 
    const _arr = [
        'HdflScfl',
        // 'HdflYgz',
        'HdflTzfl',
        'HdflKsfl',
        // 'HdflXxfl'
    ];
    let _hdfl = {};
    for(let i in _arr)
    {
        const _n = _arr[i];
        _hdfl[_n] = await get_2(_n);
    }    
    // 
    const text = '<b>首充返利</b>' + '\n' +
    '以每天第一笔充值为准，隔天领取，当天未领取则失效，规则如下：' + '\n' +
    '有效流水   返利比例' + '\n' +
    await activy_table(_hdfl['HdflScfl']['data'],' 倍            ',' %') + '\n' +
    '最高返利：<b>'+await mTon(_hdfl['HdflScfl']['max'])+'</b> 豆' + '\n' +
    '活动时间：'+_hdfl['HdflScfl']['start_time']+' 至 '+_hdfl['HdflScfl']['end_time'] + '\n' +
    '活动状态：'+await timeCheck(_hdfl['HdflScfl'])  + '\n\n' +
    // 
    // '月工资'+
    // '合计当月有效流水，隔月领取，当月未领取则失效，规则如下：'+
    // '有效流水<'+
    // await activy_table(_hdfl['HdflYgz']['data'],'',' 豆')+
    // '活动时间：'+_hdfl['HdflYgz']['start_time']+' 至 '+_hdfl['HdflYgz']['end_time'] +
    // '活动状态：'+await timeCheck(_hdfl['HdflYgz'])
    // 
    "--------------------------------------------------------------------------------------" + '\n' +
    // 
    '<b>投注返利</b>' + '\n' +
    '合计当天游戏投注金豆，隔天领取，当天未领取则失效，规则如下：' + '\n' +
    '有效流水：<b>'+_hdfl['HdflTzfl']['ls']+'</b> 倍' + '\n' +
    '返利比例：<b>'+_hdfl['HdflTzfl']['odd']+'</b> %' + '\n' +
    '最高返利：<b>'+await nTom(_hdfl['HdflTzfl']['max'])+'</b> 豆' + '\n' +
    '活动时间：'+_hdfl['HdflTzfl']['start_time']+' 至 '+_hdfl['HdflTzfl']['end_time'] + '\n' +
    '活动状态：'+await timeCheck(_hdfl['HdflTzfl']) + '\n\n' +
    // 
    "--------------------------------------------------------------------------------------" + '\n' +
    // 
    '<b>亏损返利</b>' + '\n' +
    '合计当天游戏投注亏损金豆，隔天领取，当天未领取则失效，规则如下：' + '\n' +
    '有效流水   返利比例' + '\n' +
    await activy_table(_hdfl['HdflKsfl']['data'],' 倍            ',' %') + '\n' +
    '亏损金豆：<b>'+ await nTom(_hdfl['HdflKsfl']['dou'])+'</b> 豆起' + '\n' +
    '最高返利：<b>'+ await nTom(_hdfl['HdflKsfl']['max'])+'</b> 豆' + '\n' +
    '活动时间：'+ _hdfl['HdflKsfl']['start_time']+' 至 '+_hdfl['HdflKsfl']['end_time'] + '\n' +
    '活动状态：'+ await timeCheck(_hdfl['HdflKsfl']) + '\n';
    // 
    const yestoday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const { UserHdfl, UserHdflSum } = await getHdfl({ user_id, yestoday })
    // 
    if(!UserHdfl || !UserHdflSum || Object.keys(UserHdfl).length<=0 || UserHdflSum<=0) return text;
    // 
    const { ls, bet, win, day_first_charge } = await USERDAYDATA.findOne({attributes:['ls', 'bet', 'win', 'day_first_charge'],where:{user_id, time: yestoday}});
    // 
    const user_yesterday_data =  "--------------------------------------------------------------------------------------" + '\n' +
    // 
    yestoday + " 数据" + '\n' +
    "有效流水：" + nTom(ls) + '\n' +
    "首充额：" + nTom(day_first_charge) + ' 美元' + '\n' +
    "投注额：" + nTom(bet) +' 金豆' + '\n' + 
    "盈亏：" + nTom(win) + ' 金豆' + '\n\n' + 
    // 
    "🔸首充返利：" + nTom(UserHdfl['HdflScfl'] || 0) + ' 金豆' + '\n' +
    "🔸投注返利：" + nTom(UserHdfl['HdflTzfl'] || 0) + ' 金豆' + '\n' +
    "🔸亏损返利：" + nTom(UserHdfl['HdflKsfl'] || 0) + ' 金豆' + '\n'  +
    "🔸总数：" + nTom(UserHdflSum) + ' 金豆';
    // 
    await SubDo({
        platform: 'user',
        path: [ 'hdfl', 'go' ],
        data: { uuidkey: uuid, id:user_id, message_id, telegram_id }
    });
    return text + user_yesterday_data;
    // 
}
// 
module.exports={
    hdflBoard
}