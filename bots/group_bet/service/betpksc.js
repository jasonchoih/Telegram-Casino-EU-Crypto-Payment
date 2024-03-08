// 
// const _dsdx = {
//     '单': [1,3,5,7,9],
//     '双': [2,4,6,8,10],
//     '大': [6,7,8,9,10],
//     '小': [1,2,3,4,5],
//     '中': [4,5,6,7],
//     '边': [1,2,3,8,9,10],
//     '大单': [7,9],
//     '小单': [1,3,5],
//     '大双': [6,8,10],
//     '小双': [2,4],
//     '大边': [8,9,10],
//     '小边': [1,2,3]
// }
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
// const deSh = async(m, type) => {
//     let _r = {};
//     let _d = _dsdx[type];
//     for(let i in _d) {
//         let _i = _d[i];
//         _r[_i] = 10;
//     }
//     // 
//     let s = 0;
//     let r = {};
//     for(let i in _r) s+=parseInt(10);
//     // 
//     let _s = m/s;
//     for(let i in _r) r[i] = parseInt(10 * _s);
//     return r;
// }
// 
const checkForSpecificPK = async(inputStr) => 
{
    if(!/^(车道([1-9]|10) \S*|冠亚和 \S*)/.test(inputStr)) return {vals: {}, type:'sc' };
    // 
    try {
        const vals = {};
        const obj = {};
        // 
        if (/^车道(?:[1-9]|10) \S*/.test(inputStr))
        {
            const regex = /车道(\d+)\s([^车道]+)/g;
            // 
            let match;
            while ((match = regex.exec(inputStr)) !== null) {
                const lane = '车道' + match[1];
                const values = match[2].trim();
                if (obj[lane]) obj[lane] += ' ' + values;
                else obj[lane] = values;
            }
            // 
            for(let i in obj){
                const pair = obj[i].match(new RegExp(Object.keys(dbz).map(x => `(${x})\\d+`).join('|'), 'g'));
                if (pair && pair.length > 0) 
                {
                    pair.forEach(match => 
                    {
                        const key = match.match(/[^0-9]+/)[0];
                        const value = parseInt(match.match(/\d+/)[0], 10) * 1000;
                        // 
                        const _key = (i+''+dbz[key]).replace(/车道(\d+)/g, (match,integer)=>{return "cd-" + integer + "-"});
                        if (value > 0) {
                            if (vals[_key]) vals[_key] += value;
                            else vals[_key] = value;
                        }
                    })
                }
                // 
                const regex = /(\d+)\D*押\D*(\d+)/g;
                let match;
                while ((match = regex.exec(obj[i])) !== null) {
                    const key = parseInt(match[1]);
                    const value = parseInt(match[2]) * 1000;
                    const _key = (i).replace(/车道(\d+)/g, (match,integer)=>{return "cd-" + integer + "-"});
                    if (key >= 1 && key <= 10) 
                    {
                        if (vals.hasOwnProperty(key)) vals[_key+key] += value; 
                        else vals[_key+key] = value;
                    }
                }
            }
            // console.log({
            //     inputStr,
            //     obj,
            //     vals
            // });
            return {
                vals,
                type:'sc'
            }
        }else{ // GYH
            const pair = inputStr.match(new RegExp(Object.keys({
                // "龙": 'long',
                // "虎": 'hu',
                '小': 'xiao',
                '大': 'da',
                '单': 'dan',
                '双': 'shuang'
            }).map(x => `(${x})\\d+`).join('|'), 'g'));
            if (pair && pair.length > 0) 
            {
                pair.forEach(match => 
                {
                    const key = match.match(/[^0-9]+/)[0];
                    const value = parseInt(match.match(/\d+/)[0], 10) * 1000;
                    // 
                    const _key = '冠亚和'.replace(/冠亚和/, 'gyh');
                    if (value > 0) {
                        if (vals[_key+'-'+dbz[key]]) vals[_key] += value;
                        else vals[_key+'-'+dbz[key]] = value;
                    }
                })
                // console.log({
                //     inputStr,
                //     obj,
                //     vals
                // });
                return {
                    vals,
                    type:'sc'
                }
            }
            const regex = /(\d+)\D*押\D*(\d+)/g;
            let match;
            while ((match = regex.exec(inputStr)) !== null) {
                const key = parseInt(match[1]);
                const value = parseInt(match[2]) * 1000;
                const _key = '冠亚和'.replace(/冠亚和/, 'gyh');
                if (key >= 3 && key <= 19) 
                {
                    // if (vals[_key+'-'+key]) vals[_key+'-'+key] += value;
                    // else  vals[_key+'-'+key] = value;
                    if (vals[key]) vals[key] += value;
                    else  vals[key] = value;
                }
            }
            // console.log({
            //     inputStr,
            //     obj,
            //     vals
            // });
            return {
                vals,
                type:'gyh'
            }
        }
    } catch (error) {
        return {
            vals: {},
            type: 'sc'
        }
    }
    
};
// 
// const test = async() =>
// {
//     await checkForSpecificPK('车道3 小100 龙100，车道2 单100，车道2 双100 车道1 1押100, 2押300, 4押500, 车道3 1押100, 2押300, 4押500')
//     // const inputStr = "车道3 小100 龙100，车道2 单100，车道2 双100 车道1 1押100, 2押300, 4押500, 车道3 1押100, 2押300, 4押500";
//     // const inputStr = "冠亚和 11押600 1押500 11押300 冠亚和 大100 小100 单100 双100 龙100 虎100";
// }
// test()
// 
module.exports={
    checkForSpecificPK
}