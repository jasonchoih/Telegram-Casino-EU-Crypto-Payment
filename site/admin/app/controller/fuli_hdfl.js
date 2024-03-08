//
const dayjs = require('dayjs'); 
const { Op, USERHDFL } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getUsersNick } = require('../service/user');
//
const list = async(d) => 
{
    const { _user_id, page, time_start, time_end, type } = d;
    // 
    const { offset,limit } = await xpage(page);
    // 
    let where = {mode:1};
    if(_user_id) where['user_id'] = _user_id;
    if(type) where['type'] = type;
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await USERHDFL.count({where});
    const rows = await USERHDFL.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    const usernicks = await getUsersNick(rows);
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            dayjs(v.time).format('YY-MM-DD'),
            v.user_id,
            usernicks[v.user_id],
            v.type,
            v.num,
            v.dou
        ])
    }
    return {
        HdflList: [
            [page, count],
            list
        ],
        HdflLoading: false
    };
}
// 
module.exports = {
    list
}