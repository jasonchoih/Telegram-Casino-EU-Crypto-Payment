// 
const dayjs = require('dayjs');
// const { admin_to_user } = require('../../tool/redis');
const { USERS, AGENT, AGENTCASH, AGENTLOGDOU } = require('../../sequelize/db28');
const { nTom } = require('../../tool/tool');
const { TCL,TCC } = require('../../service/transaction');
// 
const go = async(d) => 
{
    let { id, money, dou, time} = d;
    // 
    const _user = await USERS.findOne({
        attributes: ['nick'], 
        where:{id}
    });
    //
    let _re = await TCL(async(transaction)=>
    {
        const _agent = await AGENT.findOne({
            attributes: ['dou'], 
            where:{agent_id: id}
        }, {transaction});
        // 
        const _agent_dou = parseInt(_agent.dou);
        // 
        if(_agent_dou < dou) throw new Error(1);
        // 
        const _agent_new_dou = parseInt( _agent_dou - dou );
        // 
        await AGENT.update({ dou: _agent_new_dou }, { where:{
            agent_id: id
        }, transaction });
        await AGENTCASH.create({
            agent_id: id,
            agent_nick: _user.nick,
            admin_id:0,
            admin_nick:'',
            money,
            dou,
            status:1,
            time
        }, { transaction });
        await AGENTLOGDOU.create({
            agent_id: id,
            type: 6,
            mode: 1,
            num: dou,
            dou: _agent_new_dou,
            des: '金豆提现，共 '+nTom(money)+' 元',
            time
        }, { transaction });
        // 
        return {
            _agent_new_dou
        }
    });
    // 
    if(!_re) return {M:{c:'提现失败，请稍后再试！'}}; 
    if(_re==1) return {M:{c:'金豆余额不足，请检查！'}}; 
    // 
    return {
        M:{c:'提现成功，待审核！'}, 
        Auth:{dou:_re._agent_new_dou},
        AgentDltxReload: dayjs().valueOf()
    }
}
// 
module.exports = {
    go
};