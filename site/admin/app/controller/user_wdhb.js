//
const dayjs = require('dayjs'); 
const { USERWDHB } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getUsersNick } = require('../service/user');
//
const list = async(d) => 
{
    const { _user_id, page } = d;
    //
    const { offset,limit } = await xpage(page);
    // 
    let where = {};
    if(_user_id) where['user_id'] = _user_id;
    // 
    const count = await USERWDHB.count(where);
    const rows = await USERWDHB.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    let list = [];
    const _usersnick = await getUsersNick(rows);
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
            v.user_id,
            _usersnick[v.user_id],
            v.hbm,
            v.num,
            v.dou
        ])
    }
    return {
        UserWdhbList: [
            [page, count],
            list
        ],
        UserWdhbLoading: false
    };
}
// 
module.exports = {
    list
}