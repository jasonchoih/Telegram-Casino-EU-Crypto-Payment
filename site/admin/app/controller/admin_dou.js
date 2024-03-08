//
const dayjs = require('dayjs'); 
const { ADMINDOULOG } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getAdminsNick } = require('../service/user');
//
const list = async(d) => 
{
    const { id, _admin_id, page, type } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    // 
    if(_admin_id) where['admin_id'] = _admin_id;
    if(type) where['type'] = type;
    // 
    const count = await ADMINDOULOG.count({ where });
    const rows = await ADMINDOULOG.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    const _adminsnick = await getAdminsNick(rows);
    let list = [];
    for(let i in rows)
    {
        const _v = rows[i];
        list.push([
            dayjs(_v.time).format('YYYY-MM-DD HH:mm:ss'),
            _v.admin_id,
            _adminsnick[_v.admin_id]||'-',
            _v.type,
            _v.mode,
            _v.num,
            _v.dou,
            _v.des
        ])
    };
    return {
        AdminDouList: [
            [page||1, count],
            list
        ],
        AdminDouLoading:false
    };
}
const listx = async(d) => 
{
    const { id, _admin_id, page, type } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    where['admin_id'] = id;
    if(type) where['type'] = type;
    // 
    const count = await ADMINDOULOG.count({ where });
    const rows = await ADMINDOULOG.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    const _adminsnick = await getAdminsNick(rows);
    let list = [];
    for(let i in rows)
    {
        const _v = rows[i];
        list.push([
            dayjs(_v.time).format('YYYY-MM-DD HH:mm:ss'),
            _v.admin_id,
            _adminsnick[_v.admin_id]||'-',
            _v.type,
            _v.mode,
            _v.num,
            _v.dou,
            _v.des
        ])
    };
    return {
        AdminDouList: [
            [page||1, count],
            list
        ],
        AdminDouLoading: false
    };
}
// 
module.exports = {
    list,
    listx
}