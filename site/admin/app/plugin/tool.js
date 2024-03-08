//
const dayjs = require("dayjs");
// 是否为空值
const isNull = async(d) => 
{
    if (typeof(d)==undefined) return true;
    return false;
}
// 手机号码
const phoneHide = async(p) => {
    return p.substring(0, 3) + "*****" + p.substr(p.length - 3);
};
// 随机数
const getRandom = async(min, max, _p = 2) => {
    return parseInt(Math.random() * (max - min) + min);
};
// 分页
const page = (page, limit = 20) => {
    page = page || 1;
    page = parseInt(page);
    let _page = page - 1;
    _page = _page > 0 ? _page : 0;
    const offset = _page * limit;
    return {
        limit,
        offset
    }
};
// 游戏时间
const getTimeDown = async(d) => {
    if (!d) return 0;
    d = dayjs(d).diff(dayjs(), 'second');
    d = d < 0 ? 0 : d;
    return d;
};
// 跳转
const GotoUrl = async(u) => {
    let _r = {};
    _r['A'] = {
        u,
        t: dayjs().valueOf()
    }
    return _r;
};
// 分页
const xpage = async(page, limit=20) =>
{
    page = page || 1;
    page = parseInt(page);
    let _page = page-1;
    _page = _page>0 ? _page : 0;
    const offset = _page * limit;
    return {
        limit,
        offset
    }
}
// 
module.exports = {
    isNull,
    phoneHide,
    getRandom,
    page,
    getTimeDown,
    GotoUrl,
    xpage
};