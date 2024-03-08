const dayjs = require("dayjs");
const { get_1_List, lrange_1_Async } = require('../plugin/redis');
// 
const _lotterys = 
    {
        jnd: 'jnd',
        pk: 'jnd',
        dd: 'ddbj',
        bj: 'ddbj',
        jnc: 'jnc',
        elg: 'elg',
        slfk: 'slfk',
        btc: 'btc',
        au: 'au',
        kr: 'kr'
    };
// 
const zst = async(d) => 
{
    if(!d) return;
    const { category, type, path } = d;
    // 
    const _lotterys = 
    {
        jnd: 'jnd',
        pk: 'jnd',
        dd: 'ddbj',
        bj: 'ddbj',
        jnc: 'jnc',
        elg: 'elg',
        slfk: 'slfk',
        btc: 'btc',
        au: 'au',
        kr: 'kr'
    };
    // 
    const x = category!= 'pk' ? 28 : 'sc';
    const n = x=='28' ? 29 : 27;
    const data = await get_1_List(_lotterys[category], 0, n);
    if(!data) return;
    // 
    const game = category+''+x;
    let list = [];
    for(let i in data)
    {
        const di = data[i];
        if(di&&di.number)
        {
            const _r = game=='pksc' ? [ di['pk']['n'], di[category][x][1] ] : [ di[category][x][1] ];
            list.push([
                di.peroids,
                dayjs(di.time).format('MM-DD HH:mm:ss'),
                ..._r
            ]);
        }
    }
    // 
    return {
        gameZst: list,
        category,
        path,
        type: x
    }
}
// 
const yc = async(d) => 
{
    const { category, type, path } = d;
    // 
    let yc  = await lrange_1_Async('yc_'+category, 0,19); // 19
    let list = [];
    for(let i in yc)
    {   
        let yci = JSON.parse(yc[i]);
        // console.log(yci[2]['sc'])
        if(category=='pk'&&type=='sc'){
            list.push([
                yci[0],
                yci[1],
                [yci[2]['sc'][0],yci[2]['sc'][1], yci[2]['sc'][2]],
                yci[2]['sc'][3]
            ]);
        }else{
            list.push([
                yci[0],
                yci[1],
                yci[2][28],
                [yci[2][36][1], yci[2][36][2] ]
            ]);
        }
    }
    // console.log(JSON.stringify({GameJg:list}))
    return {
        GameJg: list,
        path,
        type,
        category
    }
}
// 
const jg = async(d) =>
{
    const { category, type, path } = d;
    // 
    const _list = await lrange_1_Async('lottery_list_'+_lotterys[category], 0, 19); // JND28
    if(!_list) return '';
    let _r = [];
    // 
    try {
        for(let i in _list)
        {
            const v = JSON.parse(_list[i]);
            if(category!=='pk'&&type!='sc'){
                _r.push([
                    v.peroids,
                    v.time,
                    v[category][28][0],
                    v[category][28][1],
                    [ v[category]['qun'][1], v[category]['qun'][2]],
                    [ v[category]['qun'][3] ]
                ])
            }else{
                _r.push([
                    v.peroids,
                    v.time,
                    v[category]['sc'][0],
                    v[category]['n'],
                    [v[category]['sc'][1][0], v[category]['sc'][1][1], v[category]['sc'][1][2]]
                ])
            }
        }
    } catch (error) {
        // console.log(error)
    }
    return {
        GameJg: _r,
        path,
        type,
        category
    }
}
//
module.exports=
{
    jg,
    yc,
    zst
}