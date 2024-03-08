//
const dayjs = require('dayjs');
const { Op, USERLOGDOU } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getUsersNick } = require('../service/user');
// 用户金豆明细
const list = async(d) =>
{
    const { user_id,time_start,time_end, page, type } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(user_id) where['user_id'] = user_id;
    if(type) where['type'] = type;
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await USERLOGDOU.count({ where });
    const rows = await USERLOGDOU.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    const _usersnick = await getUsersNick(rows);
    // console.log(_usersnick);
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            v.user_id,
            _usersnick[v.user_id]||'-',
            v.type,
            v.mode,
            v.num,
            v.dou,
            v.des||'-',
            dayjs(v.time).format('YY-MM-DD HH:mm:ss')
        ])
    }
    return {
        UserDouList: [
            [page, count],
            list
        ],
        UserDouListLoading: false
    };
}
// 
module.exports = {
    list
};