//
const dayjs = require('dayjs'); 
const { ADMIN, ADMINCHARGE } = require('../sequelize/db28');
const { SubDo } = require('../plugin/redis');
const { xpage } = require('../plugin/tool');
const { moneyToNumber } = require('../service/tool');
const { getAdminsNick } = require('../service/user');
// moneyToNumber 

//
const list = async(d) => 
{
    const { id, _admin_id, page } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(_admin_id) where['admin_id'] = _admin_id;
    // 
    const count = await ADMINCHARGE.count({ where });
    const rows = await ADMINCHARGE.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    const _adminsnick = await getAdminsNick(rows);
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        // 
        list.push([
            v.admin_id,
            _adminsnick[v.admin_id]||'-',
            v.money,
            v.dou,
            dayjs(v.time).format('YYYY-MM-DD HH:mm:ss'),
        ])
    }
    return {
        AdminDouUpList: [
            [page, count],
            list
        ],
        AdminDouUpListLoading:false
    };
}
// 
const kf = async(d) => 
{
    const { id } = d;
    // 
    if(id!==1)
    {
        return {M:{c:'该账号不能进行客服上分，请联系主管！'}};
    }
    // 
    const rows = await ADMIN.findAll({attributes:['id','nick'],where:{status:1}});
    let AdminDouUpKf = [];
    for(let i in rows)
    {
        let v = rows[i];
        AdminDouUpKf.push([
            v.id,
            v.nick
        ]);
    }
    return {
        AdminDouUpKf,
        AdminDouUpKfLoading:''
    };
}
// 
const up = async(d) => 
{
    let { uuidkey, id, _admin_id, money, ip } = d;
    // 
    if(!_admin_id)
    {
        return {M:{c:'Please select customer service first！'}};
    }
    // 
    money = await moneyToNumber(money);
    // 
    if(!money || money<=0)
    {
        return {M:{c:'Wrong amount'}};
    }
    // 
    if(id!==1)
    {
        return {M:{c:'This account cannot be used for customer service'}};
    }
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    if(!_admin)
    {
        return {M:{c:'Parameter error!'}};
    }
    const _admin_dou = parseInt(_admin.dou);
    const _money_dou = parseInt( parseInt(money)*1000 );
    if(id!=_admin_id && _admin_dou<_money_dou)
    {
        return {M:{c:'Insufficient balance！'}};
    }
    // 
    const ab = (id==_admin_id&&id==1) ? 'upa' : 'upb';
    // 
    await SubDo({ 
        path:[ 'admin_charge', ab ],
        data:{ uuidkey, id, _admin_id, money, ip }
    });
}
// 
module.exports = {
    kf,
    up,
    list
}