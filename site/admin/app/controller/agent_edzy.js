//
const dayjs = require('dayjs'); 
const { AGENTEDZY } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
// const { getAgentsNick } = require('../service/user');
//
const list = async(d) => 
{
    const { id, form_agent_id, to_agent_id, page, status } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(form_agent_id) where['form_agent_id'] = form_agent_id;
    if(to_agent_id) where['to_agent_id'] = to_agent_id;
    if(status) where['status'] = status;
    // 
    const count = await AGENTEDZY.count({ where });
    const rows = await AGENTEDZY.findAll({
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
            _v.form_agent_id,
            _v.form_agent_nick,
            _v.to_agent_id,
            _v.to_agent_nick,
            _v.money,
            _v.status
        ])
    };
    return {
        AgentEdzyList: [
            [page||1, count],
            list
        ],
        AgentEdzyLoading: false
    };
}
// 
module.exports = {
    list
}