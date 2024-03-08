//
const dayjs = require('dayjs'); 
const { Op, AGENTCHARGE } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
//
const list = async(d) => 
{
    const { id, _agent_id, _user_id, page, time_start, time_end, status } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(_agent_id) where['agent_id'] = _agent_id;
    if(_user_id) where['user_id'] = _user_id;
    if(status) where['status'] = status;
    // 
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await AGENTCHARGE.count({ where });
    const rows = await AGENTCHARGE.findAll({
        attributes: ['agent_id','agent_nick','user_id','user_nick','money','up_rate','agent_cut_dou','status','time'],
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    let list = [];
    for(let i in rows)
    {
        const _v = rows[i];
        list.push([
            dayjs(_v.time).format('YYYY-MM-DD HH:mm:ss'),
            _v.agent_id,
            _v.agent_nick,
            _v.user_id,
            _v.user_nick,
            _v.money,
            parseFloat(_v.up_rate),
            _v.agent_cut_dou,
            _v.status
        ])
    };
    return {
        AgentChargeList: [
            [page||1, count],
            list
        ],
        AgentChargeListLoading: false
    };
}
// 
module.exports = {
    list
}