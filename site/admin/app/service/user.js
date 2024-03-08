// 
const { USERS,USERDATA, ADMIN } = require('../sequelize/db28');
// 
const getUsersNick = async(rows) => 
{
    let id = [];
    for(let i in rows)
    {
        id.push(rows[i]['user_id']);
    }
    if(id.length<=0) return {};
    id = Array.from(new Set(id));
    // 
    const _users = await USERS.findAll({attributes:['id','nick'],where:{id}});
    let _usersnick = {};
    for(let i in _users)
    {
        let _ui = _users[i];
        _usersnick[_ui.id] = _ui.nick;
    }
    return _usersnick;
}
// 
const getAgentsNick = async(rows) => 
{
    let id = [];
    for(let i in rows)
    {
        id.push(rows[i]['agent_id']);
    }
    if(id.length<=0) return {};
    id = Array.from(new Set(id));
    // 
    const _users = await USERS.findAll({attributes:['id','nick'],where:{id}});
    let _usersnick = {};
    for(let i in _users)
    {
        let _ui = _users[i];
        _usersnick[_ui.id] = _ui.nick;
    }
    return _usersnick;
}
// 
const getAdminsNick = async(rows) => 
{
    let id = [];
    for(let i in rows)
    {
        id.push(rows[i]['admin_id']);
    }
    if(id.length<=0) return {};
    id = Array.from(new Set(id));
    // 
    const _admins = await ADMIN.findAll({attributes:['id','nick'],where:{id}});
    let _adminsnick = {};
    for(let i in _admins)
    {
        let _ui = _admins[i];
        _adminsnick[_ui.id] = _ui.nick;
    }
    return _adminsnick;
}
// 
const getUsersData = async(rows) => 
{
    let id = [];
    for(let i in rows)
    {
        id.push(rows[i]['id']);
    }
    if(id.length<=0) return {};
    id = Array.from(new Set(id));
    // 
    const _userdatas = await USERDATA.findAll({attributes:['user_id','bank','dou','exp'],where:{user_id:id}});
    let _userdata = {};
    for(let i in _userdatas)
    {
        let _ui = _userdatas[i];
        _userdata[_ui.user_id] = {
            bank: _ui.bank,
            dou: _ui.dou,
            exp: _ui.exp
        };
    }
    return _userdata;
}
// 
const getAgentInfo = async(rows) => 
{
    let id = [];
    for(let i in rows)
    {
        id.push(rows[i]['agent_id']);
    }
    if(id.length<=0) return {};
    id = Array.from(new Set(id));
    // 
    const _users = await USERS.findAll({attributes:['id','user','nick','cs','status'],where:{id}});
    let _usersnick = {};
    for(let i in _users)
    {
        let _ui = _users[i];
        _usersnick[_ui.id] = {
            user: _ui.user,
            nick: _ui.nick,
            cs: _ui.cs,
            status: _ui.status,
        }
    }
    return _usersnick;
}
// 
const getUserPhoneIdNcik = async(rows) => 
{
    let phone = [];
    for(let i in rows)
    {
        phone.push(rows[i]['phone']);
    }
    if(phone.length<=0) return {};
    // 
    const _users = await USERS.findAll({attributes:['id','phone','nick'],where:{phone}});
    let _r = {};
    for(let i in _users)
    {
        let _ui = _users[i];
        _r[_ui.phone] = {
            id: _ui.id,
            nick: _ui.nick
        }
    }
    return _r;
}
//
module.exports = {
    getAdminsNick,
    getAgentsNick,
    getUsersNick,
    getUsersData,
    getAgentInfo,
    getUserPhoneIdNcik
};