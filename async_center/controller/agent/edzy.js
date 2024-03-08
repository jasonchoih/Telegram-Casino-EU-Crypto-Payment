// 
const dayjs = require('dayjs');
const { admin_to_user, redis_2_pub } = require('../../tool/redis');
const { Op, USERS, AGENT, AGENTEDZY, AGENTLOGDOU } = require('../../sequelize/db28');
const { nTom } = require('../../tool/tool');
const { TCL } = require('../../service/transaction');
// const { agentExchangeSum } = require('../../service/agentsum');
// 
const one = async(d) => 
{
    const { id, _user_id, _user_nick, _user_id_uuid, money, time} = d;
    // 
    if(!money || !_user_id || !_user_nick) return {M:{c:'转移失败，请稍后再试！'}};
    //
    let _re = await TCL(async(transaction)=>
    {
        const _user = await USERS.findOne({
            attributes: ['nick'], 
            where:{id}
        }, { transaction });
        const _agent = await AGENT.findOne({
            attributes: ['dou'], 
            where:{agent_id:id}
        }, { transaction });
        // 
        if(!_user || !_agent) throw new Error(1);
        //
        const _agent_dou = parseInt(_agent.dou);
        const dou = parseInt(money*1000);
        // 
        if(_agent_dou<dou) throw new Error(2);
        // 
        const _agent_new_dou = parseInt( _agent_dou - dou );
        // 
        await AGENT.update({ dou: _agent_new_dou }, { where:{
            [Op.and]: [
                { agent_id: id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        await AGENTEDZY.create({
            form_agent_id: id,
            form_agent_nick: _user.nick,
            to_agent_id: _user_id,
            to_agent_nick: _user_nick,
            money,
            dou,
            status: 1,
            time
        }, { transaction });
        await AGENTLOGDOU.create({
            agent_id: id,
            type: 3,
            mode: 1,
            num: dou,
            dou: _agent_new_dou,
            des: '额度转移至 '+_user_nick+'，共 '+nTom(money)+' 元',
            time
        }, { transaction });
        // 
        return {
            _agent_new_dou,
            _agent_nick: _user.nick
        }
    });
    // 
    if(!_re || _re==1 || _re==100) return {M:{c:'转移失败，请稍后再试！'}};
    if(_re==2) return {M:{c:'金豆不足，转移失败，请检查！'}};
    // 
    await admin_to_user({
        _user_id_uuid,
        data:{
            Msg:{
                t: '收到额度转移',
                c: ['合计：'+nTom(money)+' 元'],
                u: 'agent/edzy'
            },
            AgentEdzyReload: dayjs().valueOf(),
            MP3:'100'
        }
    });
    // 
    return {
        M:{c:'额度转出成功，待接收！'},
        Auth:{dou:_re._agent_new_dou},
        AgentEdzyReload: dayjs().valueOf()
    }
}
// 
const two = async(d) => 
{
    const { id, _id, form_agent_id, form_agent_nick, time} = d;
    // 
    const _form_user = await USERS.findOne({
        attributes: ['uuid'], 
        where:{id: form_agent_id}
    });
    if(!_form_user) return {M:{c:'转移接收失败，请稍后再试！'}};
    // 
    let _re = await TCL(async(transaction)=>
    {
        await AGENTEDZY.update({ status: 2 }, { where:{
            id: _id,
            status: 1
        }, transaction });
        return {
            status: 1
        }
    });
    // 
    if(!_re || _re==100) return {M:{c:'转移接收失败，请稍后再试！'}};
    // 
    await admin_to_user({
        _user_id_uuid: form_agent_id+'-'+_form_user.uuid,
        data:{
            Msg:{
                t: '额度转出确认',
                c: [form_agent_nick],
                u: 'agent/edzy'
            },
            AgentEdzyReload: dayjs().valueOf()
        }
    });
    // 
    return {
        M:{c:'额度接收成功，等待确认！'},
        Auth:{dou:_re._agent_new_dou},
        AgentEdzyReload: dayjs().valueOf(),
        MP3:'100'
    }
}
// 
const thr = async(d) => 
{
    const { id, _id, to_agent_id, time} = d;
    // 
    const _to_user = await USERS.findOne({
        attributes: ['uuid'], 
        where:{id: to_agent_id}
    });
    if(!_to_user) return {M:{c:'额度转移确认失败，请稍后再试！'}};
    // 
    let _re = await TCL(async(transaction)=>
    {
        // 转出者
        const edzy = await AGENTEDZY.findOne({where:{id:_id,form_agent_id:id,status:2}, transaction});
        if(!edzy) throw new Error(1);
        // 转入者
        const _to_agent = await AGENT.findOne({where:{agent_id:edzy.to_agent_id}, transaction});
        if(!_to_agent) throw new Error(2);
        // 
        const dou = parseInt(edzy.dou);
        const _to_agent_dou = parseInt( dou + parseInt(_to_agent.dou) );
        // 
        if(!_to_agent_dou || _to_agent_dou<=0) throw new Error(3);
        //
        await AGENT.update({ dou: _to_agent_dou }, { where:{
            agent_id: edzy.to_agent_id
        }, transaction });
        await AGENTLOGDOU.create({
            agent_id: edzy.to_agent_id,
            type: 31,
            mode: 2,
            num: edzy.dou,
            dou: _to_agent_dou,
            des: '额度接收自 '+edzy.form_agent_nick+'，共 '+nTom(edzy.money)+' 元',
            time
        }, { transaction });
        // 
        await AGENTEDZY.update({ status: 3 }, { where:{
            id: _id,
            status: 2
        }, transaction });
        return {
            money: edzy.money,
            _to_agent_dou
        }
    });
    // 
    if(!_re || _re==100) return {M:{c:'转移接出确认失败，请稍后再试！'}};
    if(_re==1) return { M:{c:'该转移不存在或已客服取消，请检查！'},AgentEdzyReload:dayjs().valueOf()};
    if(_re==2) return { M:{c:'额度转移时发生错误，请重试！'},AgentEdzyReload:dayjs().valueOf()};
    if(_re==3) return { M:{c:'额度转移时发生错误，请重试！'},AgentEdzyReload:dayjs().valueOf()};
    // 
    await admin_to_user({
        _user_id_uuid: to_agent_id+'-'+_to_user.uuid,
        data:{
            Auth:{
                dou: _re._to_agent_dou
            },
            Msg:{
                t: '额度转入确认',
                c: ['合计 '+nTom(_re.money)+' 元'],
                u: 'agent/edzy'
            },
            AgentEdzyReload: dayjs().valueOf(),
            MP3:'100'
        }
    });
    // 
    return {
        M:{c:'额度接出成功，对方已收到转移金豆！'},
        AgentEdzyReload: dayjs().valueOf()
    }
}
// 
module.exports = {
    one,
    two,
    thr
};