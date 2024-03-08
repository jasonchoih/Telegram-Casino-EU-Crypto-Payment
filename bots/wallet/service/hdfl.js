// 
const dayjs = require("dayjs");
const { get_2 } = require('../plugin/redis');
const { QueryTypes, sequelize, USERDAYDATA, USERS } = require('../sequelize/db28');
// 
// 时间判断
const timeCheck = async(d) => 
{
    const { start_time, end_time } = d;
    // 
    const _start = dayjs(start_time).diff(dayjs(),'second');
    if(_start>0) 1;
    //
    const _end = dayjs(end_time).diff(dayjs(),'second');
    if(_end<=0) 1;
    //
    return 2;
}
// 最高返利
const reMax = async(_r, max) => 
{
    if(_r > max) return max;
    return _r;
}
// 阶梯赔率
const oddCheck = async(data, ls) => 
{
    let _d = [ ...data, { ls, odd:'-' } ]; // 组合
    _d.sort( (a, b) => { return parseFloat(a.ls) - parseFloat(b.ls) }); // 排序
    const _i = _d.findIndex(v=>v.odd=='-'); // 取位
    const _ii = _i-1; // 位置
    if(_ii==-1) return { ls:data[0]['ls'],odd:'0' };
    return _d[_ii];
}
// 下线昨日投注
const getXxflData = async ({ parent, yestoday }) =>
{
    const _parents = await USERS.findAll({attributes: ['id'],where:{ parent }});
    if(_parents)
    {
        let _user_ids = [];
        for(let i in _parents)
        {
            const _pi = _parents[i];
            _user_ids.push(_pi.id);
        }
        if(_user_ids.length>0)
        {
            const _bets = await sequelize.query('SELECT '+
            'sum(ls) as bets '+
            " FROM user_day_data where user_id in ("+_user_ids+") and time=?", 
            {
                replacements: [yestoday],
                type: QueryTypes.SELECT,
                plain: true,
            });
            if(_bets && _bets.bets) return parseInt(_bets.bets);
        }
        return 0;
    }
    return 0;
}
//
let optS = {};
// 首充返利
optS['HdflScfl'] = async(d) => 
{
    const _check = await timeCheck(d);
    if(_check==1) return 0;
    let { name, _ls, data, max, _day_first_charge } = d;
    // 
    if(!_day_first_charge || _day_first_charge=='0') return 0;
    max = parseInt(max); // 最高返利
    const userchargemoney = parseInt(_day_first_charge);
    const userchargedou = parseInt( userchargemoney *  1000 );
    const _charge_ls_odd = parseFloat(_ls / userchargedou);
    // 
    const { ls, odd } = await oddCheck(data, _charge_ls_odd);
    // 
    if(odd=='0') return 0;
    return await reMax(parseInt(userchargedou * parseFloat(odd/100)), max);
}
// 投注返利
optS['HdflTzfl'] = async(d) => 
{
    const _check = await timeCheck(d);
    if(_check==1) return 0;
    let { name, _bet, _ls, ls, max, odd } = d;
    // 
    if(_bet<=0) return 0;
    // 
    max = parseInt(max); // 最高返利
    odd = parseFloat(odd); // 返利倍数
    ls = parseFloat(ls); // 流水倍数
    // 
    return await reMax(parseInt(_bet * parseFloat(odd/100)), max);
}
// 亏损返利
optS['HdflKsfl'] = async(d) => 
{
    const _check = await timeCheck(d);
    if(_check==1) return 0;
    let { name, _win, dou, _ls, data, max } = d;
    // 
    if(_win>=0) return 0;
    //
    dou = parseInt(dou); // 最低亏损多少豆起
    max = parseInt(max); // 最高返利
    // 
    const __win = -(_win);
    //
    const _win_ls_odd = parseFloat(_ls / __win);
    const { ls, odd } = await oddCheck(data, _win_ls_odd);
    // 
    if(__win < dou) return 0;
    //
    if(odd=='0') return 0;
    return await reMax(parseInt(__win * parseFloat(odd/100)), max);
}
// 下线返利
optS['HdflXxfl'] = async(d) => 
{
    const _check = await timeCheck(d);
    if(_check==1) return 0;
    let { name, dou, odd, max, user_id, yestoday } = d;
    // 
    const usertgfl = await getXxflData({
        parent: user_id,
        yestoday
    });
    //
    if(!usertgfl || usertgfl=='0' || usertgfl<=0 || usertgfl<=parseInt(dou)) return 0;
    //
    const parentbetdou = parseInt(usertgfl);
    max = parseInt(max); // 最高返利
    odd = parseFloat(odd); // 返利倍数
    return await reMax(parseInt(parentbetdou * parseFloat(odd/100)), max);
}
// 获取活动返利
const getHdfl = async({ user_id, yestoday }) => 
{
    // 昨日流水 / 昨日投注 / 昨日盈亏 /昨日首充
    const userdaydata = await USERDAYDATA.findOne({
        attributes: ['ls','bet','win','day_first_charge','scfl','tzfl','ksfl','xxfl'],
        where:{
            user_id,
            time: yestoday
        }
    });
    _ud = { _ls: 0, _bet: 0, _win: 0, _day_first_charge: 0  };
    if(userdaydata)
    {
        _ud = {
            _ls: parseInt(userdaydata.ls),
            _bet: parseInt(userdaydata.bet),
            _win: parseInt(userdaydata.win),
            _day_first_charge: parseInt(userdaydata.day_first_charge),
        };
    }
    // 
    const _arri = ['scfl','tzfl','ksfl','xxfl'];
    const _arr = ['HdflScfl','HdflTzfl','HdflKsfl','HdflXxfl'];
    let UserHdfl = {};
    for(let i in _arr)
    {
        const _ni = _arri[i];
        const _n = _arr[i];
        let _a = 0;
        // 
        if(userdaydata&&userdaydata[_ni]==1)
        {
            _a = await optS[_n]({
                name: _n,
                ...await get_2(_n),
                ..._ud,
                user_id,
                yestoday
            });
        }
        if(_a>0) UserHdfl[_n] = _a;
    }
    // 
    let UserHdflSum = 0;
    if(Object.keys(UserHdfl).length>0)
    {
        for(let i in UserHdfl)
        {
            UserHdflSum+= parseInt(UserHdfl[i]);
        }
    }
    // 
    return {
        UserHdfl,
        UserHdflSum,
    };
}
//
// -----------------------------------------------------------------------------------------
// 
const getYgzMonthData = async(user_id, prev_month) => 
{
    const _user_day_data = await sequelize.query('SELECT '+
    'sum(ls) as lss'+
    " FROM user_day_data where user_id=? and time like '"+prev_month+"%' ", 
    {
        replacements: [user_id],
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 
    if(_user_day_data && _user_day_data.lss) return _user_day_data.lss;
    return 0;
}
const getYgz = async({ user_id, this_month }) => 
{
    // 
    const _gz = await get_2('HdflYgz');
    const start_time = _gz.start_time;
    const end_time = _gz.end_time;
    // 未开始
    const _start = dayjs(start_time).diff(dayjs(),'second');
    if(_start>0) return 0;
    // 已结束
    const _end = dayjs(end_time).diff(dayjs(),'second');
    if(_end<=0) return 0;
    //
    const prev_month = dayjs(this_month).subtract(1, 'month').format('YYYY-MM'); // 上月
    // 
    const lss = await getYgzMonthData(user_id, prev_month);
    // 检查 上月 是否已领取，记录在本月份第一天
    const userdaydata = await USERDAYDATA.findOne({attributes:['ygz'],where:{user_id,time: this_month}});
    // 
    if(userdaydata && userdaydata.ygz==2) return 0;
    // 
    const _d = await oddCheck(_gz.data, lss);
    if(!_d || !_d.odd || _d.odd=='0') return 0;
    return _d.odd;
}
//
module.exports = {
    getHdfl,
    getYgz
};