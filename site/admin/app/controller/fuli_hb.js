//
const dayjs = require('dayjs'); 
const { ADMIN, HONGBAO } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { KMID } = require('../plugin/cryptos');
// 
const go = async(d) => 
{
    let { id, num, money } = d;
    // 
    if(id!=1 && money>2000)
    {
        return {
            M:{c:'客服账号最高只能生成2000元的单个红包！'},
            HbLoading:''
        }
    }
    // 
    num = parseInt(num);
    money = parseInt(money);
    if(!num || !money || num<1 || money<1)
    {
        return {M:{c:'数据错误，请更正！'},HbLoading:''}
    }
    // 
    const _admin = await ADMIN.findOne({attributes:['nick'],where:{id}});
    // 
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let kbms = [];
    for(let i=0;i<num;i++)
    {
        kbms.push({
            admin_id: id,
            admin_nick: _admin.nick,
            hbm: money+'-'+await KMID(),
            money,
            dou: parseInt(parseInt(money)*1000),
            status: 1,
            op_admin_id: 0,
            op_admin_nick: '-',
            time
        })
    }
    // 
    await HONGBAO.bulkCreate(kbms);
    // 
    return {
        M:{c:'Successfully created Red Pocket(s)!'},
        HbLoading:false,
        ...await list({page:1})
    }
}
//
const stop = async(d) => 
{
    let { id, _id } = d;
    // 
    _id = parseInt(_id);
    if(!_id || _id<1)
    {
        return {M:{c:'数据错误，请更正！'}}
    }
    // 
    const _hbm = await HONGBAO.findOne({where:{id:_id}});
    if(!_hbm || !_hbm.status) return {M:{c:'该红包码不存在，请检查！'}};
    if(_hbm.status==2) return {M:{c:'该红包码已被领取，请检查！'},...await list({page:1})};
    const _admin = await ADMIN.findOne({attributes:['nick'],where:{id}});
    // 
    await HONGBAO.update({
        status: 3,
        op_admin_id: id,
        op_admin_nick: _admin.nick
    },{
        where:{id:_id}
    });
    // 
    return {
        M:{c:'Successfully Cancelled Red Pocket!！'},
        ...await list({page:1})
    }
}
//
const list = async(d) => 
{
    const { page } = d;
    //
    const { offset,limit } = await xpage(page);
    // 
    const count = await HONGBAO.count();
    const rows = await HONGBAO.findAll({
        // where,
        order: [['id','DESC']],
        offset,
        limit
    });
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        const _g = dayjs().diff(dayjs(v.time), 'seconds');
        list.push([
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
            v.admin_nick,
            v.hbm,
            v.money,
            _g>=86400 ? 4 : v.status,
            v.op_admin_nick,
            v.id
        ])
    }
    return {
        HbList: [
            [page, count],
            list
        ],
        HbLoading: false
    };
}
// 
module.exports = {
    go,
    list,
    stop
}