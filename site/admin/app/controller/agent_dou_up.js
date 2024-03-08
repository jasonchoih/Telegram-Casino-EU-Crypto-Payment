// 
const dayjs = require('dayjs');
// 
const { ADMIN, USERS, AGENT, AGENTDOUUP } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { SubDo } = require('../plugin/redis');
const { getAgentsNick, getAdminsNick } = require('../service/user');
// 代理上分 - 首页
const list = async(d) =>
{
    const { id, _agent_id, _admin_id, page } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(_agent_id) where['agent_id'] = _agent_id;
    if(_admin_id) where['admin_id'] = _admin_id;
    // 
    const count = await AGENTDOUUP.count({ where });
    const rows = await AGENTDOUUP.findAll({
        attributes: ['id','num','agent_id','admin_id','agent_dou','admin_dou','time'],
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    // 
    const _agents = await getAgentsNick(rows);
    const _admins = await getAdminsNick(rows);
    // 
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        // 
        list.push([
            v.admin_id,
            _admins[v.admin_id]||'-',
            v.admin_dou,
            v.num,
            v.agent_id,
            _agents[v.agent_id]||'-',
            v.agent_dou,
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
        ])
    }
    return {
        AgentDouUpList: [
            [page, count],
            list
        ],
        AgentDouUpLoading:false
    };
}
//
const up = async(d) => 
{
    const { uuidkey,id, agent_id,money, ip } = d;
    // 
    let AgentDouUpUpStatus = {};
    if(!money||money<1)
    {
        AgentDouUpUpStatus['money'] = { s: 'error', h: '上分金额必须填写，且最低为 1 元' };
        return { AgentDouUpUpStatus };
    }
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    if(parseInt(parseInt(_admin.dou)/1000)<money)
    {
        AgentDouUpUpStatus['money'] = { s: 'error', h: '您的金豆余额不足，请先联系主管充值 - 1' };
        return { AgentDouUpUpStatus };
    }
    if(_admin.role<=1) return { M:{c:'客服账号不能编辑或添加信息，请通知主管进行处理！'} };
    // 
    const _user = await USERS.findOne({attributes: ['id','uuid'],where:{id:agent_id}});
    if(!_user) return { M:{c:'缺少信息，请联系技术员或重试！1'} };
    const _agent = await AGENT.findOne({attributes: ['id'],where:{agent_id}});
    if(!_agent) return { M:{c:'缺少信息，请联系技术员或重试！2'} };
    // 
    const _user_id_uuid = _user.id+'-'+_user.uuid;
    //
    await SubDo({ 
        path:[ 'agent_dou_up', 'up' ],
        data:{ uuidkey, _user_id_uuid, id, agent_id, money, ip }
    });
}
// 查看
const get = async(d) => 
{
    const { agent_id } = d;
    let AgentDouUpGetStatus = {};
    if(!agent_id)
    {
        AgentDouUpGetStatus['agent_id'] = { s: 'error', h: '必须输入！' };
        return { AgentDouUpGetStatus };
    }
    const AgentUser = await USERS.findOne({
        attributes: ['id','role','nick','status'],
        where:{
            id: agent_id
        }
    });
    // 
    if(!AgentUser)
    {
        AgentDouUpGetStatus['agent_id'] = { s: 'error', h: 'Member ID does not exist' };
        return { AgentDouUpGetStatus,  };
    }
    if(AgentUser.role==1)
    {
        AgentDouUpGetStatus['agent_id'] = { s: 'error', h: 'This ID is not an agent account, please replace it' };
        return { AgentDouUpGetStatus };
    }
    if(AgentUser.status==2)
    {
        AgentDouUpGetStatus['agent_id'] = { s: 'error', h: 'Agent ID has been frozen, please check' };
        return { AgentDouUpGetStatus };
    }
    // 
    const _data = await AGENT.findOne({
        attributes: ['dou'],
        where:{agent_id}
    });
    // 
    return { 
        AgentDouUpGet: {
            ...AgentUser.dataValues,
            agent_id,
            dou: _data.dou+''
        } 
    };
}
//
module.exports = {
    list,
    get,
    up
};