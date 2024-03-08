//
const dayjs = require('dayjs'); 
const { AGENTLOGDOU } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getAgentsNick } = require('../service/user');
//
const list = async(d) => 
{
    const { id, _agent_id, page, type } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(_agent_id) where['agent_id'] = _agent_id;
    if(type) where['type'] = type;
    // 
    const count = await AGENTLOGDOU.count({ where });
    const rows = await AGENTLOGDOU.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    const _agentsnick = await getAgentsNick(rows);
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        // 
        list.push([
            dayjs(v.time).format('YYYY-MM-DD HH:mm:ss'),
            v.agent_id,
            _agentsnick[v.agent_id]||'-',
            v.type,
            v.mode,
            v.num,
            v.dou,
            v.des||'-',
        ])
    }
    return {
        AgentDouList: [
            [page, count],
            list
        ],
        AgentDouLoading: false
    };
}
// 
module.exports = {
    list
}