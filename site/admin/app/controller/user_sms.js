//
const dayjs = require('dayjs');
const { Op, USERPHONESMS } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getUserPhoneIdNcik } = require('../service/user');
//
const list = async(d) =>
{
    const { _ip, time_start, time_end, phone, page, type } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(phone) where['phone'] = { [Op.like]: '%'+phone+'%' };
    if(type) where['type'] = type;
    if(_ip) where['ip'] = { [Op.like]: '%'+_ip+'%' };
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await USERPHONESMS.count({ where });
    const rows = await USERPHONESMS.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    //
    let list = [];
    const idUserNick = await getUserPhoneIdNcik(rows);
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
            v.type,
            idUserNick&&idUserNick[v.phone]&&idUserNick[v.phone]['id'] || '-',
            idUserNick&&idUserNick[v.phone]&&idUserNick[v.phone]['nick'] || '-',
            v.phone,
            v.code,
            v.ip
        ])
    }
    return {
        UserSmsList: [
            [page, count],
            list
        ],
        UserSmsListLoading:false
    };
}
// 
module.exports = {
    list
};