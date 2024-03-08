//
const dayjs = require('dayjs'); 
const { Op, AGENTCARD } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getAgentsNick } = require('../service/user');
//
const list = async(d) => 
{
    const { _agent_id, _user_id, page, time_start, time_end } = d;
    //
    const { offset,limit } = await xpage(page);
    // 
    let where = {};
    if(_agent_id) where['agent_id'] = _agent_id;
    if(_user_id) where['user_id'] = _user_id;
    // 
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await AGENTCARD.count(where);
    const rows = await AGENTCARD.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    let list = [];
    const _agentnick = await getAgentsNick(rows);
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
            v.user_id,
            v.user_name,
            v.km,
            v.agent_id,
            _agentnick[v.agent_id],
            v.down_rate,
            v.agent_add,
            v.agent_rate
        ])
    }
    return {
        AgentCardList: [
            [page, count],
            list
        ],
        AgentCardLoading: false
    };
}
// 
module.exports = {
    list
}