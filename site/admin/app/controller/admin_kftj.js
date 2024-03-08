// 
const dayjs = require("dayjs");
const { QueryTypes, sequelize, ADMIN, ADMINSUM } = require('../sequelize/db28');
// 
const sums = async(admin_id) => 
{
    const _admin = await ADMIN.findOne({attributes:['nick'],where:{id:admin_id}});
    const adminsum = await ADMINSUM.findOne({where:{admin_id}});
    let AdminTjxx = ['-',0,0,0,0];
    if(adminsum)
    {
        AdminTjxx = 
        [
            _admin.nick||'-',
            adminsum.sys_charge||'-',
            adminsum.admin_charge||'-',
            adminsum.agent_charge||'-',
            adminsum.exchange||'-',
        ];
    }
    return { AdminTjxx };
}
// 
const getDays = async(fix) => 
{
    const days = dayjs().daysInMonth();
    let _r = [];
    for(let i=1;i<=days;i++)
    {
        let _ii = i<10 ? '0'+i : i;
        _r.push(fix+''+_ii)
    }
    _r.push('sum');
    return _r;
}
const getMonths = async(fix) => 
{
    let _r = [];
    for(let i=1;i<13;i++)
    {
        let _ii = i<10 ? '0'+i : i;
        _r.push(fix+''+_ii)
    }
    _r.push('sum');
    return _r;
}
const getDatas = async({type,id,time,list}) => 
{
    const lists = await sequelize.query('SELECT '+
    'DATE_FORMAT(time,?) as times,'+
    'sum(sys_charge) as sys_charges,'+
    'sum(admin_charge) as admin_charges,'+
    'sum(agent_charge) as agent_charges,'+
    'sum(exchange) as exchanges'+
    " FROM admin_day_data where admin_id=? and time like '"+time+"%' GROUP BY times ORDER BY times DESC", 
    {
        replacements: [type,id],
        type: QueryTypes.SELECT,
        plain: false,
    });
    let _r = {};
    let AdminTjxxListSum = [0,0,0,0];
    for(let i in lists)
    {
        const _li = lists[i];
        _r[_li.times] = 
        [
            _li.sys_charges,
            _li.admin_charges,
            _li.agent_charges,
            _li.exchanges
        ];
        AdminTjxxListSum[0]+= _li.sys_charges;
        AdminTjxxListSum[1]+= _li.admin_charges;
        AdminTjxxListSum[2]+= _li.agent_charges;
        AdminTjxxListSum[3]+= _li.exchanges;
    }
    // 
    _r['sum'] = AdminTjxxListSum;
    let AdminTjxxList = [];
    for(let i in list)
    {
        const _li = list[i];
        const _dd = _r[_li] ? _r[_li] : [];
        AdminTjxxList.push([
            _li,
            ..._dd
        ]);
    }
    // 
    return {AdminTjxxList};
}
// 
const now = async(d) => 
{
    let { id, _admin_id } = d;
    _admin_id = _admin_id || 1;
    //
    const type = '%Y-%m-%d';
    const time = dayjs().format('YYYY-MM-')+'';
    const list = await getDays(dayjs().format('YYYY-MM-'));
    //
    return {
        AdminTjxxLoading:false,
        ...await sums(_admin_id),
        ...await getDatas({id:_admin_id,type,time,list})
    }
}
// 
const year = async(d) => 
{
    let { id, _admin_id, year } = d;
    _admin_id = _admin_id || 1;
    //
    const type = '%Y-%m';
    const time = year+'-';
    const list = await getMonths(year+'-');
    //
    return {
        AdminTjxxLoading:'',
        ...await getDatas({id:_admin_id,type,time,list})
    }
}
// 
const month = async(d) => 
{
    let { id, _admin_id, month } = d;
    _admin_id = _admin_id || 1;
    //
    const type = '%Y-%m-%d';
    const time = month+'-';
    const list = await getDays(month+'-');
    //
    return {
        AdminTjxxLoading:'',
        ...await getDatas({id:_admin_id,type,time,list})
    }
}
// 
module.exports = {
    now,
    year,
    month
};