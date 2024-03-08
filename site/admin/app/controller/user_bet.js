// 
const dayjs = require("dayjs");
const { Op, USERBET } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getUsersNick } = require('../service/user');
// 
const list = async(d) => 
{
    const {  user_id, game, peroids, page, time_start, time_end, status, jc } = d;
    let category = '';
    let type = '';
    if(game) [ category, type ] = game;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(user_id) where['user_id'] = user_id;
    if(category) where['category'] = category;
    if(type) where['type'] = type;
    if(peroids) where['peroids'] = peroids;
    if(status) where['status'] = status;
    if(jc==2) 
    {
        where['vals'] = 
        {
            [Op.like]: '%:-%'
        };
    }
    // 
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await USERBET.count({ where });
    const rows = await USERBET.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    const _usersnick = await getUsersNick(rows);
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            v.id,
            v.user_id,
            _usersnick[v.user_id]||'-',
            v.mode,
            v.category+'/'+v.type,
            v.peroids,
            v.dou,
            v.win_dou,
            v.status,
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
            v.ls
        ])
    }
    return {
        UserBetList: [
            [page, count],
            list
        ],
        UserBetListLoading: false
    };
}
//
module.exports = {
    list
};