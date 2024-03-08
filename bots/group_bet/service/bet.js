const { redis_1_lottery_fou, get_1_List_fou_new } = require('../plugin/redis');
// 
const _dsdx = {
    '单': [1,3,5,7,9,11,13,15,17,19,21,23,25,27],
    '双': [0,2,4,6,8,10,12,14,16,18,20,22,24,26],
    '大': [14,15,16,17,18,19,20,21,22,23,24,25,26,27],
    '小': [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
    '中': [10,11,12,13,14,15,16,17],
    '边': [0,1,2,3,4,5,6,7,8,9,18,19,20,21,22,23,24,25,26,27],
    '大单': [15,17,19,21,23,25,27],
    '小单': [1,3,5,7,9,11,13],
    '大双': [14,16,18,20,22,24,26],
    '小双': [0,2,4,6,8,10,12],
    '大边': [18,19,20,21,22,23,24,25,26,27],
    '小边': [0,1,2,3,4,5,6,7,8,9]
}
// 
const _type_num_val_odd = {
    "0":[1000,1],
    "1":[333.33,3],
    "2":[166.67,6],
    "3":[100,10],
    "4":[66.66,15],
    "5":[47.61,21],
    "6":[35.71,28],
    "7":[27.77,36],
    "8":[22.22,45],
    "9":[18.18,55],
    "10":[15.87,63],
    "11":[14.49,69],
    "12":[13.69,73],
    "13":[13.33,75],
    "14":[13.33,75],
    "15":[13.69,73],
    "16":[14.49,69],
    "17":[15.87,63],
    "18":[18.18,55],
    "19":[22.22,45],
    "20":[27.77,36],
    "21":[35.71,28],
    "22":[47.61,21],
    "23":[66.66,15],
    "24":[100,10],
    "25":[166.66,6],
    "26":[333.33,3],
    "27":[1000,1]
}
// 
const dbz = {
    "豹子": 'bao',
    "顺子": 'shun',
    "对子": 'dui',
    "半子": 'ban',
    "杂子": 'za'
}
//
const deSh = async(m, type) => 
{
    let _r = {};
    let _d = _dsdx[type];
    for(let i in _d)
    {
        let _i = _d[i];
        _r[_i] = _type_num_val_odd[_i][1];
    }
    // 
    let s = 0;
    let r = {};
    for(let i in _r) s+=parseInt(_type_num_val_odd[i][1]);
    // 
    let _s = m/s;
    // console.log(_s);
    for(let i in _r) r[i] = parseInt(_type_num_val_odd[i][1] * _s);
    return r
}
// 
const checkForSpecificKeys = async(inputStr) => 
{
    if(/^(车道([1-9]|10) \S*|冠亚和 \S*)/.test(inputStr)) return {
        vals: {},
        type: 28
    }
    // 
    try {
        const bets = [];
        for(let i in _dsdx) bets.push(i);
        // 
        const pairs = {};
        const pair_regex = new RegExp(bets.map(x => `(${x})\\d+`).join('|'), 'g');
        const pair = inputStr.match(pair_regex);
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
        //
        // const singles = (inputStr.match(/(\d+)押(\d{1,2})/g) || []).reduce((acc, match) => 
        // {
        //     const [_, amount, number] = match.match(/(\d+)押(\d{1,2})/);
        //     const parsedAmount = parseInt(amount) * 1000;
        //     const parsedNumber = parseInt(number);
        //     console.log({
        //         parsedAmount,
        //         parsedNumber
        //     })
        //     // 
        //     if (parsedAmount > 0 && parsedNumber >= 0 && parsedNumber <= 27) {
        //         acc[parsedNumber] = (acc[parsedNumber] || 0) + parsedAmount;
        //     }
        //     return acc;
        // }, {});
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
        // if(Object.keys(singles).length >0){
        //     for(let i in singles){
        //         if (vals[i]) vals[i] +=singles[i] 
        //         else vals[i] =singles[i]
        //     }
        // }
        // 
        const regex = /(\d+)\D*押\D*(\d+)/g;
        let match;
        while ((match = regex.exec(inputStr)) !== null) {
            const key = parseInt(match[1]);
            const value = parseInt(match[2]) * 1000;
            // console.log({
            //     key,value
            // })
            if (key >= 0 && key <= 27) 
            {
                if (vals.hasOwnProperty(key)) vals[key] += value; 
                else vals[key] = value;
            }
        }
        // 
        if(Object.keys(vals).length===0)
        {
            const pairs = {};
            const pair_regex = new RegExp(Object.keys(dbz).map(x => `(${x})\\d+`).join('|'), 'g');
            const pair = inputStr.match(pair_regex);
            // 
            if (pair && pair.length > 0) {
                pair.forEach(match => {
                    const key = match.match(/[^0-9]+/)[0];
                    const value = parseInt(match.match(/\d+/)[0], 10) * 1000;
                    if(value > 0){
                        if (pairs[dbz[key]]) pairs[dbz[key]] += value;
                        else pairs[dbz[key]] = value;
                    }
                })
            }
            return { vals: pairs, type: 36 }
        }
        return { vals, type: 28 };
        // 
    } catch (error) {
        return {
            vals: {},
            type: 28
        }
    }
};
// 
const getNextLottery = async (category, type) =>
{
   let _fou = await redis_1_lottery_fou(category, category, type);
   if(!_fou) return;
   return _fou[_fou.length-1]
}
// 
// const test = async()=>{
//     const a = await checkForSpecificKeys("大100 中100 下小100")
//     console.log(a)
// }
// test()
// 
module.exports = {
    checkForSpecificKeys,
    getNextLottery,
    get_1_List_fou_new
}