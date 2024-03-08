//
const dayjs = require('dayjs'); 
const { AGENTCASH } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getAgentsNick, getAdminsNick } = require('../service/user');
const { SubDo } = require('../plugin/redis');
//
const list = async(d) => 
{
    const { id, _agent_id,_admin_id, page, status } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(_agent_id) where['agent_id'] = _agent_id;
    if(_admin_id) where['admin_id'] = _admin_id;
    if(status) where['status'] = status;
    // 
    const count = await AGENTCASH.count({ where });
    const rows = await AGENTCASH.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    const _agents = await getAgentsNick(rows);
    const _admins = await getAdminsNick(rows);
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        // 
        list.push([
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
            v.agent_id,
            _agents[v.agent_id]||'-',
            v.money,
            v.admin_id,
            _admins[v.admin_id]||'-',
            v.status,
            v.id
        ])
    }
    return {
        AgentDltxList: [
            [page, count],
            list
        ],
        AgentDltxLoading: false
    };
}
// 
const status_change = async(d) => 
{
    const { uuidkey, ip, id, status, _id } = d;
    // 
    if(![2,3].find(v=>v==status)) return { M:{c:'参数错误！'} };
    // 
    const _path = 
    {
        2: 'agree',
        3: 'cancel'
    };
    // 
    await SubDo({ 
        path:[ 'agent_dltx', _path[status] ],
        data:{ uuidkey, ip, id, status, _id }
    });
}
// 
module.exports = {
    list,
    status_change
}