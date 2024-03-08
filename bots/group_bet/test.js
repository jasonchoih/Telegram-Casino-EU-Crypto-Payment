// const { checkForSpecificKeys, get_1_List_fou_new } = require('./service/bet');
// const { redis_1_lottery_fou } = require('./plugin/redis');
// const dayjs = require('dayjs');


// const test = async () =>
// {
//     const { peroids } = await get_1_List_fou_new('slfk');
//     const a = await redis_1_lottery_fou('slfk','slfk', 28)
//     console.log(a, peroids)

//     console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'))
// }

// test()

// 
const _dsdx = {
    // '单': [1,3,5,7,9],
    // '双': [0,2,4,6,8],
    // '大': [6,7,8,9,10],
    // '小': [1,2,3,4,5],
    '中': [4,5,6,7],
    '边': [1,2,3,8,9,10],
    '大单': [7,9],
    '小单': [1,3,5],
    '大双': [6,8,10],
    '小双': [2,4],
    '大边': [8,9,10],
    '小边': [1,2,3]
}
// 
const dbz = {
    "龙": 'long',
    "虎": 'hu',
    '小': 'xiao',
    '大': 'da',
    '单': 'dan',
    '双': 'shuang'
}
// 
const deSh = async(m, type) => {
    let _r = {};
    let _d = _dsdx[type];
    for(let i in _d) {
        let _i = _d[i];
        _r[_i] = 10;
    }
    // 
    let s = 0;
    let r = {};
    for(let i in _r) s+=parseInt(10);
    // 
    let _s = m/s;
    for(let i in _r) r[i] = parseInt(10 * _s);
    return r;
}
// 
const checkForSpecificKeys = async(inputStr) => 
{
    const sc_regex = /^车道-(?:[1-9]|10) \S*/;
    if(!sc_regex.test(inputStr)) return;
    // 
    const [cd , text ] = inputStr.split(/\s(.+)/);
    // 
    const bets = [];
    for(let i in _dsdx) bets.push(i);
    // // 
    const pairs = {};
    const pair_regex = new RegExp(bets.map(x => `(${x})\\d+`).join('|'), 'g');
    const pair = text.match(pair_regex);
    // 
    if (pair && pair.length > 0) {
        pair.forEach(match => {
            const key = match.match(/[^0-9]+/)[0];
            const value = parseInt(match.match(/\d+/)[0], 10) * 1000;
            if (value > 0) {
                if (pairs[key]) pairs[key] += value;
                else pairs[key] = value;
            }
            
        })
    }
    // YA
    const singles = (text.match(/(\d+)押(\d{1,2})/g) || []).reduce((acc, match) => 
    {
        const [_, amount, number] = match.match(/(\d+)押(\d{1,2})/);
        const parsedAmount = parseInt(amount) * 1000;
        const parsedNumber = parseInt(number);
        // 
        if (parsedAmount > 0 && parsedNumber >= 0 && parsedNumber <= 10) {
            acc[parsedNumber] = (acc[parsedNumber] || 0) + parsedAmount;
        }
        return acc;
    }, {});
    // 
    const vals = {};
    if(Object.keys(pairs).length >0){
        for(let i in pairs){
            const r = await deSh(pairs[i], i);
            for(let j in r){
                if (vals[j]) vals[j] += r[j]
                else vals[j] = r[j];
            }
        }
    }
    if(Object.keys(singles).length >0){
        for(let i in singles){
            if (vals[i]) vals[i] +=singles[i] 
            else vals[i] =singles[i]
        }
    }
    // 
    const regex = /(?:龙|虎|小|大|单|双)(\d+)/;
    const parts = text.split(" ");
    const sums = {};
    parts.forEach(part => {
        const match = part.match(regex);
        if (match) {
            const character = part[0]; 
            const num = parseInt(match[1] *1000);
            sums[dbz[character]] = (sums[dbz[character]] || 0) + num;
        }
    });
    // 
    const _cd  = cd.replace('车道', 'cd')
    const newObj = {};
    for(let i in {...vals, ...sums}){
        newObj[ _cd + '-' + i] = {...vals, ...sums}[i];
    }
    console.log({
        vals: newObj,
        type:'sc'
    })
};
// 
const test = async()=>
{
    // 龙 虎
    await checkForSpecificKeys('车道-1 小10 中10 ')
}

test()