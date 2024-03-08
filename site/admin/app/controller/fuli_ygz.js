//
const dayjs = require('dayjs'); 
const { Op, USERHDFL } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getUsersNick } = require('../service/user');
//
const list = async(d) => 
{
    const { _user_id, page, time_start, time_end } = d;
    //
    const { offset,limit } = await xpage(page);
    // 
    let where = {mode:2};
    if(_user_id) where['user_id'] = _user_id;
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
            v.num,
            v.dou
        ])
    }
    return {
        YgzList: [
            [page, count],
            list
        ],
        YgzLoading: false
    };
}
// 
module.exports = {
    list
}