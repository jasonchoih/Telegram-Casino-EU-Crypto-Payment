//
const { get_2 } = require('./redis');
const { dot2 } = require('./tool');
const { USERBET } = require('../sequelize/db28');
// 
const get_types = async(category) => 
{
    if(category=='pk') return ['sc','gyh','10','22','gj','lh']; 
    return [11,16,28,36,'28gd'];
}
// 
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
// 
const get_pk_sc = async(h, n) => 
{
    let _r = [
        'gyh-'+h,
        'gyh-'+await pkdaxiao(h),
        'gyh-'+await pkdanshuang(h),
        'gyh-'+await pklonghu(n[0], n[1]),
    ]
    for(let i=0;i<10;i++)
    {
        let _i = i+1;
        let _ni = n[i];
        _r.push('cd-'+_i+'-'+_ni);
        _r.push('cd-'+_i+'-'+await pkcddaxiao(_ni));
        _r.push('cd-'+_i+'-'+await pkdanshuang(_ni));
        _r.push('cd-'+_i+'-'+await pklonghu(n[i],n[9-i]));
    }
    return _r;
}
// 
const get_category_type = async(_category, peroids) => 
{
    if(_category=='jnd')
    {
        return [
            {
                category: 'jnd',
                peroids,
                type: await get_types(_category)
            },
            {
                category: 'pk',
                peroids,
                type: await get_types('pk')
            },
            {
                category: 'q214',
                peroids,
                type: ['jnd','pk']
            },
            {
                category: 'q28',
                peroids,
                type: ['jnd','pk']
            }
        ];
    }
    if(_category=='ddbj')
    {
        return [
            {
                category: 'dd',
                peroids,
                type: await get_types(_category)
            },
            {
                category: 'bj',
                peroids,
                type: await get_types(_category)
            },
            {
                category: 'q214',
                peroids,
                type: ['dd', 'bj']
            },
            {
                category: 'q28',
                peroids,
                type: ['dd', 'bj']
            }
        ];
    }
    return [
        {
            category: _category,
            peroids,
            type: await get_types(_category)
        },
        {
            category: 'q214',
            peroids,
            type: [ _category ]
        },
        {
            category: 'q28',
            peroids,
            type: [ _category ]
        }
    ];
}
// 
const get_jg = async(category, type, jg) => 
{
    let _new = {};
    // 
    if(category=='q214'||category=='q28')
    {
        for(let i in type)
        {
            let _type_i = type[i];
            if(_type_i=='pk')
            {
                _new[_type_i] = await get_pk_sc(jg['pk']['gyh'][1], jg['pk']['n']);
            }else{
                _new[_type_i] = jg[_type_i]['qun'];
            }
        }
        return _new;
    }
    // 
    if(category=='pk')
    {
        for(let i in type)
        {
            let _type_i = type[i];
            if(_type_i=='sc')
            {
                _new[_type_i] = await get_pk_sc(jg[category]['gyh'][1], jg[category]['n']);
            }else{
                _new[_type_i] = [ jg[category][_type_i][1] ];
            }
        }
        return _new;
    }
    //
    for(let i in type)
    {
        let _type_i = type[i];
        let _type_is = _type_i=='28gd' ? '28' : _type_i;
        _new[_type_i] = [ jg[category][_type_is][1] ];
    }
    return _new;
}
// 
const oddCheck = async(betsum, odds, type) => 
{
    // console.log(betsum, odds, type);
    if(betsum<=0 || type=='28gd')
    {
        return odds[1];
    }
    // 如果投注额大于最高投注，返回最低赔率
    if(betsum > odds[2])
    {
        return odds[0];
    }
    let _per = (betsum / odds[2]);
    let _cha = odds[1] - (_per * (odds[1]-odds[0]));
    // 
    if(!_cha || _cha < odds[0])
    {
        return odds[0];
    }
    // 
    return dot2(_cha);
}
const get_odd = async(d) => 
{
    // console.log(d);
    const { category,type,peroids } = d;
    const betsum = await USERBET.sum('dou',{where:{category,type,peroids}});
    // console.log('---------------111111111-------------',betsum);
    const odds = await get_2('odd-'+category+'-'+type);
    // console.log('---------------222222222-------------',odds);
    let _p = {};
    for(let i in odds)
    {
        _p[i] = await oddCheck(betsum, odds[i], type);
    }
    // console.log('---------------222222222-------------',_p);
    // 
    return _p;
}
const get_odds = async(d) => 
{
    let _r = {};
    // console.log(d);
    for(let i in d)
    {
        let _i = d[i];
        _r[_i.type] = await get_odd(_i);
    }
    return _r;
}
// 
const check_jg = async(category, type, vals, jg) => 
{
    let _r = [];
    // const odd = await get_2('odd-'+category+'-'+type);
    // 
    const _vals = JSON.parse(vals);
    const _jg = jg[type];
    // const _odd = odd[type][0];
    for(let i in _vals)
    {
        let _is_win = _jg.find(v=>(v+'')==(i+''));
        if(_is_win || _is_win=='0') 
        {
            _r.push([
                i, // 中奖号码
                _vals[i], // 投注金额
            ])
        }
    }
    // 
    // console.log(category, type, vals, _jg);
    // 
    return _r;
}
// 
const _dxdsbdsbz = [
    'da','xiao','dan','shuang',
    'dadan','xiaodan','dashuang','xiaoshuang',
    'jida','jixiao',
    'bao','shun','dui','ban','za'
];
// 
const qunOddCheck = async(category, type, _number, _jg, _odd) => 
{
    if(type=='pk')
    {
        return _odd;
    }
    if(category=='q214')
    {
        if([13,14].find(v=>v==_jg[type][0]) && _dxdsbdsbz.find(v=>v==_number))
        {
            return 1;
        }
    }
    if(category=='q28')
    {
        for(let i in _jg[type])
        {
            if([13,14,'bao','dui','shun'].find(v=>v==_jg[type][i]) && _dxdsbdsbz.find(v=>v==_number))
            {
                return 1;
            }
        }
    }
    // 
    return _odd;
}
//
module.exports = 
{
    get_types,
    get_category_type,
    get_jg,
    check_jg,
    get_odds,
    qunOddCheck
};