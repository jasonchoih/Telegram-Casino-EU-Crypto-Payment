// 
const _dsdx = {
    '单': [1,3,5,7,9],
    '双': [2,4,6,8,10],
    '大': [6,7,8,9,10],
    '小': [1,2,3,4,5],
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
const checkForSpecificPK = async(inputStr) => 
{
    if(!/^(车道([1-9]|10) \S*|冠亚和([1-9]|10) \S*)/.test(inputStr)) return {vals: {}, type:'sc' }
    // 
    const [cd, text ] = inputStr.split(/\s(.+)/);
    // 
    const vals = {};
    if(/^车道(?:[1-9]|10) \S*/.test(inputStr)) // 车道1-10
    {
        const bets = [];
        for(let i in _dsdx) bets.push(i);
        // 
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
            if (parsedAmount > 0 && parsedNumber > 0 && parsedNumber <= 10) {
                acc[parsedNumber] = (acc[parsedNumber] || 0) + parsedAmount;
            }
            return acc;
        }, {});
        // 
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
        const newVals = {}
        for(let i in vals){
            const n = cd.replace('车道','cd-') + '-' + i;
            newVals[n] = vals[i];
        }
        // console.log('CD', {
        //     cd,
        //     text,
        //     vals,
        //     newVals
        // })
        return {
            vals: newVals,
            type: 'sc'
        }
    }
    else{          
        // 
        // if(/^冠亚和(?:[1-9]|10) \S*/.test(inputStr)); // GYH
        const pair = text.match(new RegExp(Object.keys(dbz).map(x => `(${x})\\d+`).join('|'), 'g'));
        if (pair && pair.length > 0) 
        {
            pair.forEach(match => 
            {
                const key = match.match(/[^0-9]+/)[0];
                const value = parseInt(match.match(/\d+/)[0], 10) * 1000;
                // 
                const _key = (cd+''+dbz[key]).replace(/冠亚和(\d+)/g, (match,integer)=>{return "cd-" + integer + "-"});
                if (value > 0) {
                    if (vals[_key]) vals[_key] += value;
                    else vals[_key] = value;
                }
            })
        }
        // console.log('GYH', {
        //     cd,
        //     text,
        //     vals
        // })
    }
    // 
    return {
        vals,
        type: 'sc'
    }
};
// 
const test = async() =>
{
    // await checkForSpecificPK('大300 大700 小30 龙50dsmad 单123 双ajn ')
    await checkForSpecificPK('车道3 小边500')
}
test()
// 
module.exports={
    checkForSpecificPK
}