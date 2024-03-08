// 
const dayjs = require('dayjs');
const { admin_to_user } = require('../../tool/redis');
const { USERS, AGENTVIP } = require('../../sequelize/db28');
const { TCL } = require('../../service/transaction');
// 
const go = async(d) => 
{
    let { id, _user_id, vip, time} = d;
    // 
    const _user = await USERS.findOne({
        attributes: ['level','role','uuid','nick','status'], 
        where:{id: _user_id}
    });
    if(!_user) return {M:{c:'升级失败，请稍后再试！'}, AgentzhsjUserCheckLoading: '',AgentzhsjStatus: {_user_id: { s: 'error' }}};
    if(_user.role==2) return {M:{c:'该账号不能进行升级，请更换！'}, AgentzhsjUserCheckLoading: '',AgentzhsjStatus: {_user_id: { s: 'error' }}};
    if(_user.status>1) return {M:{c:'该账号异常或已被冻结，请更换！'}, AgentzhsjUserCheckLoading: '',AgentzhsjStatus: {_user_id: { s: 'error' }}};
    // 
    const _level = parseInt(_user.level);
    if(_level==7) return { M:{c:'账号级别已是 VIP'+_level+'，无法再升！'} };
    vip = parseInt(vip);
    if(_level>=vip) return { M:{c:'账号级别已是 VIP'+_level+'，请更换为更高级别！'} };
    //
    let _re = await TCL(async(transaction)=>
    {
        await USERS.update({ level: vip }, { where:{
            id: _user_id
        }, transaction });
        await AGENTVIP.create({
            agent_id: id,
            user_id: _user_id,
            user_nick: _user.nick,
            vip,
            time
        }, { transaction });
        // 
        return 'ok'
    });
    // 
    if(!_re) return {M:{c:'回收失败，请稍后再试！'}}; 
    //
    await admin_to_user({
        _user_id_uuid: _user_id+'-'+_user.uuid,
        data:{
            Msg:{
                t: '账号升级',
                c: ['级别：VIP'+vip],
                u: 'user'
            },
            AgentEdzyReload: dayjs().valueOf()
        }
    });
    // 
    return {
        M:{c:'账号升级成功！'},
        AgentZhsjReload: dayjs().valueOf()
    }
}
// 
module.exports = {
    go
};