//
const dayjs = require("dayjs");
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);
// 金额转数字
const mTon = (n) =>
{
  n = n+'';
  n = n.replace(/,/gi, '');
  n = parseInt(n)
  return !n ? '' : n;
}
// 数字转金额
const nTom = (n) =>
{
    n = n+'';
    if(n==0) return '0';
    return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => 
    {
        return $1 + ",";
    });
}
// 保留两位小数
const dot2 = (e) => 
{
    e = e.toString();
    let _vvs = e.split('.');
    if(_vvs[1]) e = _vvs[0]+'.'+_vvs[1].substring(0, 2);
    e = parseFloat(e);
    return e
}
// 手机号码
const phoneHide = async(p) => {
    return p.substring(0, 3) + "*****" + p.substr(p.length - 3);
};
// 随机数
const getRandom = async(min, max, _p = 2) => {
    return parseInt(Math.random() * (max - min) + min);
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
// 对象数量和总和
const objNumSum = async(obj) => 
{
    let dou = 0;
    for(let i in obj) dou+=parseInt(obj[i]);
    let num = Object.keys(obj).length;
    return { dou, num };
}
// 获取年月日第几周
const getYearMonthDayWeek = async() => 
{
    return {
        year: dayjs().format('YYYY'),
        month: dayjs().format('MM'),
        day: dayjs().format('DD'),
        week: dayjs().isoWeek()
    }
}
// 
const oddCheck = async(data, ls) => 
{
    let _d = [ ...data, { ls, odd:'-' } ]; // 组合
    _d.sort( (a, b) => { return parseFloat(a.ls) - parseFloat(b.ls) }); // 排序
    const _i = _d.findIndex(v=>v.odd=='-'); // 取位
    const _ii = _i-1; // 位置
    if(_ii==-1) return { ls:data[0]['ls'],odd:'0' };
    return _d[_ii];
}
// 游戏名称
const names = {
    jnd: '加拿大',
    pk: 'PK',
    jnc: '加拿大西部',
    bj: '台湾宾果',
    dd: '台湾蛋蛋',
    au: '澳洲',
    elg: '俄勒冈',
    slfk: '斯洛伐克',
    kr: '韩国',
    btc: '比特币',
    q214: '群2.14',
    q28: '群2.8',
    //
    gd: '固定',
    sc: '赛车',
    gyh: '冠亚和',
    gj: '冠军',
    lh: '龙虎',
};
const GameName = async(category, type) => 
{
  let categoryName = '';
  if(category) categoryName = names[category];
  if(!type) return categoryName;
  if(['q214','q28'].find(v=>v==category)) categoryName = '';
  let typeName = type+'';
  for(let i in names)
  {
    typeName = typeName.replace(new RegExp(i,'g'), names[i]);
  }
  if(['q214'].find(v=>v==category)) typeName = typeName+'2.14';
  if(['q28'].find(v=>v==category)) typeName = typeName+'2.8';
  return categoryName+''+typeName;
}
// 百分比
const percent = (num, total) =>
{
    if (num == 0 || total == 0) return 0;
    return (Math.round(num / total * 10000) / 100.00);
}
//
const math_abs = async(e) => 
{
    return Math.abs(parseInt(e));
}
const valsChange = async(vals) => 
{
    let _n = {};
    for(let i in vals)
    {
        _n[i] = await math_abs(vals[i]);
    }
    return _n;
}
// 
const _jgTxt = {
    //
    cd: '车道',
    gyh: '冠亚和',
    // 
    long: '龙',
    hu: '虎',
    // 
    bao: '豹',
    shun: '顺',
    dui: '对',
    ban: '半',
    za: '杂',
    // 
    da: '大',
    xiao: '小',
    dan: '单',
    shuang: '双',
    dadan: '大单',
    dashuang: '大双',
    xiaodan: '小单',
    xiaoshuang: '小双',
    jida: '极大',
    jixiao: '极小',
}
  // 
  const getJgText = (e) => 
  {
    // console.log(e)
    let _e = e.toString().split('-');
    if(_e.length>0)
    {
        let _ee = [];
        for(let i in _e)
        {
            _ee.push(_jgTxt[_e[i]]||_e[i]);
        }
        if(_ee.length>0) return _ee.join('-');
    }
    return _jgTxt[e]||e;
}
// 
module.exports = {
    getYearMonthDayWeek,
    objNumSum,
    GameName,
    phoneHide,
    getRandom,
    getTimeDown,
    GotoUrl,
    xpage,
    mTon,
    nTom,
    dot2,
    percent,
    //
    valsChange,
    getJgText,
    // 
    oddCheck
};