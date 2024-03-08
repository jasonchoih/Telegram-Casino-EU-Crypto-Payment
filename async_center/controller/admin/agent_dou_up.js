// 
const { admin_to_user } = require('../../tool/redis');
const { Op, USERS, AGENT, AGENTLOGDOU, AGENTDOUUP, ADMINLOG, ADMIN, ADMINDOULOG } = require('../../sequelize/db28');
const { nTom } = require('../../tool/tool');
const { AdminSums } = require('../../service/adminsum');
const { TCL, TCC } = require('../../service/transaction');
// 
const up = async(d) => 
{
    const { _user_id_uuid,id, agent_id, money, ip, time } = d;
    // 
    let AgentDouUpUpStatus = {};
    let _re = await TCL(async(transaction) => 
    {
        const _admin = await ADMIN.findOne({
            attributes: ['dou'], 
            where:{id}
        }, { transaction });
        let _admin_dou = parseInt(_admin.dou);
        let _dou = parseInt(money*1000);
        if(_admin_dou<_dou) throw new Error(1);
        let _admin_new_dou = parseInt(_admin_dou - _dou);
        const _agent = await AGENT.findOne({
            attributes: ['dou'], 
            where:{agent_id}
        }, { transaction });
        let _agent_dou = parseInt(_agent.dou);
        let _agent_new_dou = parseInt(_agent_dou + _dou);
        //
        await ADMIN.update({ dou: _admin_new_dou }, { where:{
            [Op.and]: [
                { id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        // 金豆明细
        const _user = await USERS.findOne({
            attributes: ['nick'], 
            where:{id:agent_id}
        }, { transaction });
        await ADMINDOULOG.create({
            admin_id: id,
            type: 2,
            mode: 1,
            num: _dou,
            dou: _admin_new_dou,
            des: agent_id+' - '+_user.nick+' 金豆余额：'+nTom(_agent_new_dou),
            time
        }, { transaction });
        //
        await AGENT.update({ dou: _agent_new_dou }, { where:{
            [Op.and]: [
                { agent_id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction }); 
        //
        await AdminSums({
            admin_id: id,
            agent_charge: _dou,
            transaction
        });
        // 日志
        await ADMINLOG.create({
            admin_id: id,
            des: '代理上分 - '+agent_id+' - '+money+'元',
            ip,
            time
        }, { transaction });
        await AGENTLOGDOU.create({
            agent_id,
            type: 5,
            mode: 2,
            num: _dou,
            dou: _agent_new_dou,
            des: '',
            time
        }, { transaction });
        // 
        await AGENTDOUUP.create({
            num: _dou,
            agent_id,
            agent_dou: _agent_new_dou,
            admin_id: id,
            admin_dou: _admin_new_dou,
            time
        }, { transaction });
        // 
        return {
            _dou,
            _admin_new_dou,
            _agent_new_dou
        }
    });
    if(!_re) {
        AgentDouUpUpStatus['money'] = { s: 'error', h: '操作失败，请重试！' } 
        return { AgentDouUpUpStatus }
    }
    if(_re==1) {
        AgentDouUpUpStatus['money'] = { s: 'error', h: '您的金豆余额不足，请先联系主管充值 - 2' } 
        return { AgentDouUpUpStatus }
    }
    // 
    await admin_to_user({
        _user_id_uuid,
        data:{
            Auth:{
                dou: _re._agent_new_dou
            },
            Msg:{
                t: '客服为您上分',
                c: ['合计：'+nTom(_re._dou)+' 豆'],
                u: 'agent/jdmx'
            }
        }
    });
    // 
    return {
        AgentDouUpGet:'',
        AgentDouUpGetStatus:'',
        AgentDouUpUpStatus:'',
        M:{c:'充值成功！'},
        Auth:{
            dou: _re._admin_new_dou
        },
        AgentDouUpReload: 1
    }
}
// 
module.exports = {
    up
};