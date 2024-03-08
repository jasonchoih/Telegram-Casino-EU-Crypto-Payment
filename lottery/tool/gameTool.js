//
const { createHash } = require('crypto');
// 
// 排序
const psort = async(d) => 
{
    let _abc = d.sort();
    return _abc;
}
// 1豹 2顺 3对 4半 5杂
const bsdbz = async(ee) =>
{
    let e = await psort(ee);
    // console.log();
    let _this_jg = '_' + (parseInt(e[0]) - parseInt(e[1])) + '_' + (parseInt(e[1]) - parseInt(e[2])) + '_';
    _this_jg = _this_jg.replace(/-/g, '');
    if (_this_jg == '_0_0_') return 'bao';
    if (_this_jg == '_1_1_'||(e[0]=='0'&&e[1]=='8'&&e[2]=='9') || (e[0]=='0'&&e[1]=='1'&& e[2]=='9')) return 'shun';
    if (_this_jg.indexOf('_0_') !== -1) return 'dui';
    if (_this_jg.indexOf('_1_') !== -1 || (e[0]=='0'&&e[2]=='9')) return 'ban';
    return 'za';
}
// 取尾数
const strLastOne = async(str) => {
    str = str + '';
    let spstr = str.split('');
    spstr = spstr[spstr.length - 1];
    return parseInt(spstr);
}
// 除以6，余数+1
const sixAddOne = async(num) => {
    return (num % 6)+1;
}
// PK 虎龙
const pklonghu = async(a, b) => {
    return parseInt(a) > parseInt(b) ? 'long' : 'hu';
}
// PK 小大 冠亚和
const pkdaxiao = async(a) => {
    return parseInt(a) > 11 ? 'da' : 'xiao';
}
// PK 小大 车道
const pkcddaxiao = async(a) => {
    return parseInt(a) > 5 ? 'da' : 'xiao';
}
// PK 单双
const pkdanshuang = async(a) => {
    return parseInt(a) % 2 == 0 ? 'shuang' : 'dan';
}
// 群玩法 小大
const qundaxiao = async(a) => {
    return parseInt(a) > 13 ? 'da' : 'xiao';
}
// 群玩法 极大极小
const qunJi = async(a) => 
{
    if(['0','1','2','3','4','5','22','23','24','25','26','27'].find(v=>v==(a+''))) return 'ji';
    return '';
}
// 数组相加
const strArrSum = async(arr) => {
    let _r = arr.reduce(function(prev, curr) {
        return parseInt(prev) + parseInt(curr);
    });
    return _r;
}
// 区位
const areaNum = (type) => {
    if (type == 'dd') {
        return {
            11: [
                [0, 1, 2, 3, 4, 5],
                [12, 13, 14, 15, 16, 17]
            ],
            16: [
                [0, 1, 2, 3, 4, 5],
                [6, 7, 8, 9, 10, 11],
                [12, 13, 14, 15, 16, 17]
            ],
            28: [
                [0, 1, 2, 3, 4, 5],
                [6, 7, 8, 9, 10, 11],
                [12, 13, 14, 15, 16, 17]
            ],
            36: [
                [0, 1, 2, 3, 4, 5],
                [6, 7, 8, 9, 10, 11],
                [12, 13, 14, 15, 16, 17]
            ]
        }
    }
    return {
        11: [
            [0, 3, 6, 9, 12, 15],
            [2, 5, 8, 11, 14, 17]
        ],
        16: [
            [0, 3, 6, 9, 12, 15],
            [1, 4, 7, 10, 13, 16],
            [2, 5, 8, 11, 14, 17]
        ],
        28: [
            [1, 4, 7, 10, 13, 16],
            [2, 5, 8, 11, 14, 17],
            [3, 6, 9, 12, 15, 18]
        ],
        36: [
            [1, 4, 7, 10, 13, 16],
            [2, 5, 8, 11, 14, 17],
            [3, 6, 9, 12, 15, 18]
        ]
    }
};
// 
const modeToJg = async(e, d) => {
    if (e == 11 || e == 16) return sixAddOne(d);
    return strLastOne(d);
};
const showJg = async(e, d) => {
    if (e == '36') return await bsdbz(d);
    return await strArrSum(d);
};
// 
const DdBjJndJg = async(type, mode, number) => {
    // console.log(type, mode, number);
    // 开奖号码
    let _area = areaNum(type)[mode];
    // 取得号码
    let num = [];
    for (let ii in _area) {
        num[ii] = [];
        for (let i in _area[ii]) {
            num[ii][i] = number[_area[ii][i]];
        }
        num[ii] = await strArrSum(num[ii]);
        num[ii] = await modeToJg(mode, num[ii]);
    }
    //
    const _jg = await showJg(mode, num);
    return [
        num,
        _jg
    ]
};
// 加拿大号码转pk赛车
const jndTopk = async(number) => {
    number = number.join('');
    let data = createHash('sha256').update(number).digest('hex').split('');
    const one = [];
    for (var i = 0, len = data.length; i < len; i += 6) {
        if (i < 55) one.push(parseInt(data.slice(i, i + 6).join(''), 16));
    }
    let two = {};
    one.map((v, k) => {
        two[k + 1] = v;
    })
    two = Object.keys(two).sort((a, b) => { return two[b] - two[a] });
    return two;
};
// type 类型
// d 号码 - 数组
// peroids 期数
const PkJg = async(type, d, peroids) => 
{
    let _one;
    switch (type) {
        case '10':
            _one = await strLastOne(peroids);
            _one = _one == 0 ? 10 : _one;
            _one = parseInt(_one) - 1;
            return [
                '',
                d[_one]
            ]
        case '22':
            let _num = [d[0], d[1], d[2]];
            return [
                _num,
                await strArrSum(_num)
            ]
        case 'gj':
            return [
                '',
                d[0]
            ]
        case 'lh':
            return [
                [d[0], d[9]],
                await pklonghu(d[0], d[9])
            ]
        case 'sc':
            _one = await strArrSum([d[0], d[1]]);
            return [
                [d[0], d[1]],
                [
                    await strArrSum([d[0], d[1]]),
                    await pkdaxiao(_one),
                    await pkdanshuang(_one),
                    await pklonghu(d[0], d[9]),
                    await pklonghu(d[1], d[8]),
                    await pklonghu(d[2], d[7]),
                    await pklonghu(d[3], d[6]),
                    await pklonghu(d[4], d[5])
                ]
            ]
        case 'gyh':
            _one = await strArrSum([d[0], d[1]]);
            return [
                [d[0], d[1]],
                _one
            ]
    }
};
//
const QunResult = async(jg1,jg2) => 
{
    // 号码
    // 大小 
    // 单双
    // 豹顺对半杂
    // 大双小双小单大单
    // 极大极小
    // 
    const _d_x = await qundaxiao(jg1);
    const _d_s = await pkdanshuang(jg1);
    const _ji = await qunJi(jg1);
    // 
    let _r = [
        jg1+'',
        _d_x,
        _d_s,
        jg2,
        _d_x+''+_d_s,
    ];
    if(_ji) _r.push(_ji+''+_d_x);
    return _r;
}
// 
const getGameListData = async(category, data) => 
{
    if(!data || !data.number) return data;
    //
    const { peroids, number } = data;
    // 
    let result = {};
    if(category=='pk')
    {
        const _number = await jndTopk(number);
        const _pk_types = [ '10', '22', 'gj', 'lh', 'sc', 'gyh' ];
        for(let i in _pk_types)
        {
            let _i = _pk_types[i];
            result[_i] = await PkJg(_i, _number, peroids);
        }
        result['n'] = _number;
        return result;
    }
    //
    const _other_types = [ 36, 11, 16, 28 ];
    for(let j in _other_types)
    {
        let _j = _other_types[j];
        result[_j] = await DdBjJndJg(category, _j, number);
    }
    result[36][0] = result[28][0];
    result['qun'] = await QunResult(result['28'][1], result['36'][1]);
    return result;
}
//
const getGameType = async(category, data) => 
{
    let result = {};
    if(category=='jnd')
    {
        result['jnd'] = await getGameListData('jnd', data);
        result['pk'] = await getGameListData('pk', data);
        return result;
    }
    if(category=='ddbj')
    {
        result['bj'] = await getGameListData('bj', data);
        result['dd'] = await getGameListData('dd', data);
        return result;
    }
    result[category] = await getGameListData(category, data);
    return result;
}
// 
// 投注情况
const gameBetData = async(category) => 
{
    let arr = [28,11,16,36,'28gd'];
    if(category=='pk') arr = ['sc','gyh','10','22','gj','lh'];
    // 
    let _r = {};
    for(let i in arr)
    {
        _r[arr[i]] = [
            0, // 投注金额
            0, // 投注人数
            0, // 中奖人数
        ];
    }
    return _r;
}
const gameBetDatas = async(category) => 
{
    let result = {};
    if(category=='jnd')
    {
        result['jnd'] = await gameBetData('jnd');
        result['pk'] = await gameBetData('pk');
        return result;
    }
    if(category=='ddbj')
    {
        result['bj'] = await gameBetData('bj');
        result['dd'] = await gameBetData('dd');
        return result;
    }
    result[category] = await gameBetData(category);
    return result;
}
//
const twoNumberRandom = async(min, max) =>
{
    return Math.random() * (max - min) + min;
}
// 随机顺序
const randSort = async(arr) => 
{
    for(var i = 0,len = arr.length;i < len; i++ )
    {
        var rand = parseInt(Math.random()*len);
        var temp = arr[rand];
        arr[rand] = arr[i];
        arr[i] = temp;
    }
    return arr;
}
const winnum = async(arr) => 
{
    if(!arr || arr[0]<=0) return [0,0,0];
    // 
    const _n = (await randSort([0.2,0.3,0.4,0.5,0.6,0.7]))[2];
    // 
    return [
        arr[0],
        arr[1],
        parseInt(arr[1]*_n),
    ];
}
const gamePwin = async(p) => 
{
    let _p = {};
    for(let i in p)
    {
        _p[i] = {};
        for(let j in p[i])
        {
            _p[i][j] = await winnum(p[i][j]);
        }
    }
    return _p;
}
//
module.exports = {
    //
    bsdbz,
    strLastOne,
    sixAddOne,
    pklonghu,
    pkdaxiao,
    pkdanshuang,
    strArrSum,
    //
    DdBjJndJg,
    PkJg,
    getGameListData,
    getGameType,
    gameBetDatas,
    gamePwin
};