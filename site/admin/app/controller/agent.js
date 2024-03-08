// 
const dayjs = require('dayjs');
// 
const { xPass } = require('../plugin/bcrypt');
const { ADMIN, ADMINLOG, USERS, USERDATA, AGENT, AGENTSUM, sequelize, QueryTypes} = require('../sequelize/db28');
const { GotoUrl, xpage } = require('../plugin/tool');
const { PhoneCheck } = require('../plugin/verify');
const { getAgentInfo } = require('../service/user');

// 代理中心 - 首页
const list = async(d) =>
{
    const { id, agent_id, agent_nick, page, status, cs } = d;
    //
    const { offset,limit } = await xpage(page);
    // let where = {};
    // if(agent_id) where['agent_id'] = agent_id;
    // if(agent_nick) where['agent_nick'] = agent_nick;
    // 
    // const count = await AGENT.count({ where });
    // const rows = await AGENT.findAll({
    //     where,
    //     order: [['id','DESC']],
    //     offset,
    //     limit
    // });
    let where = ' where 1 ';
    if(agent_id) where+= ' and a.agent_id='+agent_id;
    if(cs) where+= ' and b.cs='+cs;
    if(status) where+= ' and b.status='+status;
    const count = await sequelize.query('SELECT count(*) as count from agent a LEFT JOIN users b on a.agent_id = b.id '+where+' limit 1',
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    // 
    const rows = await sequelize.query('SELECT a.*,b.user,b.nick,b.cs,b.status from agent a LEFT JOIN users b on a.agent_id = b.id '+where+' order by id desc limit '+offset+','+limit,
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    // 
    // console.log(rows);
    // const _agent_info = await getAgentInfo(rows);
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        // const _agent = _agent_info[v.agent_id] || {};
        list.push([
            v.agent_id,
            v.user,
            v.nick,
            v.dou,
            v.up_rate,
            v.down_rate,
            v.up_max,
            v.ph,
            v.cs,
            v.status,
        ])
    }
    return {
        AgentList: [
            [page, count.count],
            list
        ],
        AgentListLoading:false
    };
}
// 查看
const get_user = async(d) => 
{
    const { user_id } = d;
    let AgentUserStatus = {};
    if(!user_id)
    {
        AgentUserStatus['user_id'] = { s: 'error', h: '必须输入！' };
        return { AgentUserStatus };
    }
    const AgentUser = await USERS.findOne({
        attributes: ['id','role','parent','user','level','calling','phone','nick','des','qq','wx','name','cs','status'],
        where:{
            id: user_id
        }
    });
    // 
    if(!AgentUser)
    {
        AgentUserStatus['user_id'] = { s: 'error', h: 'Member ID does not exist' };
        return { AgentUserStatus };
    }
    if(AgentUser.role==2)
    {
        AgentUserStatus['user_id'] = { s: 'error', h: 'The Member ID is already an Agent account' };
        return { AgentUserStatus };
    }
    if(AgentUser.status==2)
    {
        AgentUserStatus['user_id'] = { s: 'error', h: 'Member ID is frozen' };
        return { AgentUserStatus };
    }
    // 
    const _data = await USERDATA.findOne({where:{user_id}});
    // 
    return { 
        AgentUser: {
            ...AgentUser.dataValues,
            dou: _data.dou,
            bank: _data.bank,
            exp: _data.exp,
            cs: AgentUser.cs+'',
            status: AgentUser.status+'',
            up_rate: 0.985,
            down_rate: 0.985,
            up_max: 100000,
            user_id: AgentUser.id
        }
    };
}
//
const add = async(d) => 
{
    const { id,user_id,pass,calling,phone,nick,des,qq,wx,name,cs,status,up_rate,down_rate,up_max,ph, ip,time } = d;
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    if(_admin.role<=1) return { M:{c:'The customer service account cannot edit or add information, please notify the manager to deal with it!'} };
    // 
    const _user = await USERS.findOne({where:{id:user_id}});
    // 
    let AgentStatus = {};
    if (up_rate>1) AgentStatus['up_rate'] = { s: 'error', h: '最大为 1' };
    if (down_rate>1) AgentStatus['down_rate'] = { s: 'error', h: '最大为 1' };
    if (up_max>1000000) AgentStatus['up_max'] = { s: 'error', h: '上分最大为 100万' };
    if (!/^[0-9]{1,16}$/.test(ph)) AgentStatus['ph'] = { s: 'error', h: 'Must be a number' };
    // if (!/^[a-zA-Z0-9\_\-|\u4E00-\u9FA5]{1,16}$/.test(nick)) AgentStatus['nick'] = { s: 'error', h: '格式为 a-zA-Z0-9_-或中文，长度2-16' };
    // if (!/^[a-zA-Z0-9\_\-|\u4E00-\u9FA5]{1,16}$/.test(des)) AgentStatus['des'] = { s: 'error', h: '格式为 a-zA-Z0-9_-或中文，长度2-16' };
    // if (!qq || !/^[0-9]{5,12}$/.test(qq)) AgentStatus['qq'] = { s: 'error', h: '格式为 5-12位数字' };
    // if (!wx || !/^[a-zA-Z0-9\_\-]{1,30}$/.test(wx)) AgentStatus['wx'] = { s: 'error', h: '格式为 a-zA-Z0-9_-长度6-30' };
    // if (name&&!/^[a-zA-Z0-9\_\-|\u4E00-\u9FA5]{1,30}$/.test(name)) AgentStatus['name'] = { s: 'error', h: '格式为 a-zA-Z0-9-_或中文，长度2-30' };
    // if (des&&!/^[a-zA-Z0-9\_\-|\u4E00-\u9FA5]{1,30}$/.test(des)) AgentStatus['des'] = { s: 'error', h: '格式为 a-zA-Z0-9-_或中文，长度2-30' };
    if (pass&&!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(pass)) AgentStatus['pass'] = { s: 'error', h: '格式为 a-zA-Z0-9_-@.，长度6-26' };
    if (!calling||!phone||!await PhoneCheck(calling, phone))
    {
        AgentStatus['calling'] = { s: 'error', h: '区号或错误' };
        AgentStatus['phone'] = { s: 'error', h: '区号或错误' };
    }
    if(calling&&phone&&(calling!=_user.calling&&phone!=_user.phone)&&await USERS.findOne({where:{calling,phone}}))
    {
        AgentStatus['calling'] = { s: 'error', h: '区号与手机已存在，请更换' };
        AgentStatus['phone'] = { s: 'error', h: '区号与手机已存在，请更换' };
    }
    if(nick&&nick!=_user.nick&&await USERS.findOne({where:{nick}})) AgentStatus['nick'] = { s: 'error', h: '昵称已存在，请更换' };
    if (Object.keys(AgentStatus).length > 0) return { AgentStatus };
    // 
    let data = { calling,phone,nick,des,qq,wx,name,cs,status };
    data['role'] = 2;
    if(pass) data['pass'] = await xPass(pass);
    await USERS.update(data,{where:{id:user_id}});
    await AGENT.create({
        agent_id: user_id,
        dou: 0,
        up_rate,
        ph,
        down_rate,
        up_max,
        status
    });
    // 代理统计
    await AGENTSUM.create({
        agent_id: user_id,
        time
    });
    // 日志
    await ADMINLOG.create({
        admin_id: id,
        des: 'Add agent - '+user_id+' - '+nick,
        ip,
        time
    });
    // 
    return {
        AgentUser:'',
        AgentUserStatus:'',
        M:{c:'Congratulations, you have successfully added an agent!'},
        ...await list({page:1})
    }
}
// 查看
const get = async(d) => 
{
    const { user_id } = d;
    const AgentUser = await USERS.findOne({
        attributes: ['id','role','parent','user','level','calling','phone','nick','des','qq','wx','name','cs','status'],
        where:{
            id: user_id
        }
    });
    // 
    const _data = await AGENT.findOne({where:{agent_id:user_id}});
    // 
    return { 
        AgentOne: {
            ...AgentUser.dataValues,
            dou: _data.dou,
            cs: AgentUser.cs+'',
            status: AgentUser.status+'',
            up_rate: _data.up_rate,
            down_rate: _data.down_rate,
            up_max: _data.up_max,
            ph: _data.ph,
            user_id: AgentUser.id
        } 
    };
}
// 更新
const update = async(d) => 
{
    const { id,user_id,pass,calling,phone,nick,des,qq,wx,name,cs,status,up_rate,down_rate,up_max,ph, ip,time } = d;
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    if(_admin.role<=1) return { M:{c:'Your account cannot edit or add information!'} };
    // 
    const _user = await USERS.findOne({where:{id:user_id}});
    // 
    let AgentStatus = {};
    if (up_rate>1) AgentStatus['up_rate'] = { s: 'error', h: 'max to 1' };
    if (down_rate>1) AgentStatus['down_rate'] = { s: 'error', h: 'max to 1' };
    if (up_max>1000000) AgentStatus['up_max'] = { s: 'error', h: 'max to 1 million points' };
    if (!/^[0-9]{1,16}$/.test(ph)) AgentStatus['ph'] = { s: 'error', h: 'The delivery amount must be a number' };
    // if (!/^[a-zA-Z0-9\_\-|\u4E00-\u9FA5]{1,16}$/.test(nick)) AgentStatus['nick'] = { s: 'error', h: '格式为 a-zA-Z0-9_-或中文，长度2-16' };
    // if (!/^[a-zA-Z0-9\_\-|\u4E00-\u9FA5]{1,16}$/.test(des)) AgentStatus['des'] = { s: 'error', h: '格式为 a-zA-Z0-9_-或中文，长度2-16' };
    // if (!qq || !/^[0-9]{5,12}$/.test(qq)) AgentStatus['qq'] = { s: 'error', h: '格式为 5-12位数字' };
    // if (!wx || !/^[a-zA-Z0-9\_\-]{1,30}$/.test(wx)) AgentStatus['wx'] = { s: 'error', h: '格式为 a-zA-Z0-9_-长度6-30' };
    // if (name&&!/^[a-zA-Z0-9\_\-|\u4E00-\u9FA5]{1,30}$/.test(name)) AgentStatus['name'] = { s: 'error', h: '格式为 a-zA-Z0-9-_或中文，长度2-30' };
    // if (des&&!/^[a-zA-Z0-9\_\-|\u4E00-\u9FA5]{1,30}$/.test(des)) AgentStatus['des'] = { s: 'error', h: '格式为 a-zA-Z0-9-_或中文，长度2-30' };
    if (pass&&!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(pass)) AgentStatus['pass'] = { s: 'error', h: 'The format is a-zA-Z0-9_-@., length 6-26' };
    if (!calling||!phone||!await PhoneCheck(calling, phone))
    {
        AgentStatus['calling'] = { s: 'error', h: 'area code error' };
        AgentStatus['phone'] = { s: 'error', h: 'area code error' };
    }
    if(calling&&phone&&(calling!=_user.calling&&phone!=_user.phone)&&await USERS.findOne({where:{calling,phone}}))
    {
        AgentStatus['calling'] = { s: 'error', h: 'The area code and phone already exist' };
        AgentStatus['phone'] = { s: 'error', h: 'The area code and phone already exist' };
    }
    if(nick&&nick!=_user.nick&&await USERS.findOne({where:{nick}})) AgentStatus['nick'] = { s: 'error', h: 'Name already exists' };
    if (Object.keys(AgentStatus).length > 0) return { AgentStatus };
    // 
    let data = { calling,phone,nick,des,qq,wx,name,cs,status };
    data['role'] = 2;
    if(pass) data['pass'] = await xPass(pass);
    await USERS.update(data,{where:{id:user_id}});
    await AGENT.update({
        up_rate,
        down_rate,
        up_max,
        ph,
        status
    },{
        where:{
            agent_id: user_id
        }
    })
    // 日志
    await ADMINLOG.create({
        admin_id: id,
        des: 'Edit agent - '+user_id+' - '+nick,
        ip,
        time
    });
    // 
    return {
        AgentOne:'',
        AgentStatus:'',
        AgentUser:'',
        AgentUserStatus:'',
        M:{c:'Congratulations, you have successfully edited the agent!'},
        ...await list({page:1})
    }
}
//
module.exports = {
    list,
    get,
    update,
    get_user,
    add
};