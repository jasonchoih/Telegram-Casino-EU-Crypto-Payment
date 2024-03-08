'use strict';
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc'); // dependent on utc plugin
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
// 
// 每期时间 
// 0 每期间隔时间
// 1 官方维护时间
// 2 官方维护时间间隔
const gamePeroidsTime = {
    jnd: [210, '20:00:00', 3600],
    ddbj: [300, '23:55:00', 25800],
    jnc: [300, '17:30:00', 7200],
    slfk: [120, '06:50:00', 18600],
    elg: [240, '19:56:00', 9360],
    au: [160, '00:00:00', 160],
    btc: [60, '00:00:00', 60],
    kr: [90, '00:00:00', 90],
}
//
//
const getYearSummerDay = async() =>
{
    // let _this = dayjs('2023-11-06 00:00:00').format('YYYY-MM-DD HH:mm:ss');
    let _this = dayjs().format('YYYY-MM-DD HH:mm:ss');
    _this = dayjs(_this).tz("Asia/Shanghai", true).utc().tz("America/Vancouver").format('YYYY-MM-DD HH:mm:ss');
    const _year = dayjs(_this).format('YYYY');
    //
    const _years = {
        2021: ['14 Mar 2021 02:00:00', '07 Nov 2021 01:59:59'],
        2022: ['13 Mar 2022 02:00:00', '06 Nov 2022 01:59:59'],
        2023: ['12 Mar 2023 02:00:00', '05 Nov 2023 01:59:59'],
        2024: ['10 Mar 2024 02:00:00', '03 Nov 2024 01:59:59'],
        2025: ['09 Mar 2025 02:00:00', '02 Nov 2025 01:59:59'],
        2026: ['08 Mar 2026 02:00:00', '01 Nov 2026 01:59:59'],
        2027: ['14 Mar 2027 02:00:00', '07 Nov 2027 01:59:59'],
        2028: ['12 Mar 2028 02:00:00', '05 Nov 2028 01:59:59'],
        2029: ['11 Mar 2029 02:00:00', '04 Nov 2029 01:59:59']
    }
    const yeay = _years[_year];
    const _start = yeay[0];
    const _end = yeay[1];
    // 
    return dayjs(_this).isBetween(_start, _end, null, '[]');
}
// 
const gamePeroidsTimex = async(category) => 
{
    const winter = {
        jnd: [210, '20:00:00', 3600],
        ddbj: [300, '23:55:00', 25800],
        jnc: [300, '17:30:00', 7200],
        slfk: [120, '06:50:00', 18600],
        elg: [240, '19:56:00', 9360],
        au: [160, '00:00:00', 160],
        btc: [60, '00:00:00', 60],
        kr: [90, '00:00:00', 90],
    }
    if(['jnd','jnc','elg','slfk'].find(v=>v==category) && await getYearSummerDay())
    {
        const summers = {
            jnd: [210, '19:00:00', 3600],
            jnc: [300, '16:30:00', 7200],
            slfk: [300, '05:50:00', 18600],
            elg: [240, '18:56:00', 9360]
        }
        return summers[category];
    }
    return winter[category];
}
// 
// 时间末尾处理
const timeLastChange = (t) =>
{
    t = t.toString();
    t = t.substr(0,t.length-1);
    return t+'0';
}
// 下一期时间
const getNextPeroidsTime = async(category, _time) => 
{
    // const game_time = gamePeroidsTime[category];
    const game_time = await gamePeroidsTimex(category);
    let add_time = game_time[0];
    let stop = false;
    if(game_time[1] && _time.indexOf(game_time[1])!==-1)
    {
        add_time = game_time[2];
        stop = true;
    }
    let time = await dayjs(_time).add(add_time, 'second').format('YYYY-MM-DD HH:mm:ss');
    time = timeLastChange(time);
    return {
        time,
        next: parseInt(await dayjs(time).diff(dayjs(), 'second')),
        stop,
    }
}
// 前端时间显示
const timeShow = async(category, time) => {
    const arr = ['jnd','pk','au'];
    if (arr.find(v=>v==category)) return dayjs(time).format('MM-DD HH:mm:ss');
    return dayjs(time).format('MM-DD HH:mm');
}
// 期数判断
const peroidsCheck = async(category, peroids, time) =>
{
    // if(category=='au') return dayjs(time).format('YYMMDD')+''+(parseInt(peroids)+1);
    if(category=='au') return dayjs(time).format('YYMMDDHHmmss');
    if(category=='slfk') return dayjs(time).format('YYMMDDHHmm');
    return parseInt(peroids)+1;
}

//
module.exports = 
{
    timeLastChange,
    gamePeroidsTime,
    getNextPeroidsTime,
    timeShow,
    peroidsCheck
};