// 
const { admin_to_user } = require('../../tool/redis');
const { Op, USERS, AGENT, AGENTCASH, AGENTLOGDOU, ADMINLOG, ADMIN, ADMINDOULOG } = require('../../sequelize/db28');
const { nTom } = require('../../tool/tool');
const { AdminSums } = require('../../service/adminsum');
const { TCL } = require('../../service/transaction');
// 
const agree = async(d) => 
{
    const { id, ip, time, _id } = d;
    // 
    let _re = await TCL(async(transaction) => 
    {
        const _agent_cash = await AGENTCASH.findOne({
            attributes: ['agent_id','agent_nick','dou','money'], 
            where:{
                id: _id
            }
        }, { transaction });
        const _admin = await ADMIN.findOne({
            attributes: ['dou','nick'], 
            where:{id}
        }, { transaction });
        if(!_agent_cash || !_agent_cash.dou || !_agent_cash.money || !_admin || !_admin.dou) throw new Error(1);
        //
        const _agent_cash_dou = parseInt(_agent_cash.dou);
        const _admin_dou = parseInt(_admin.dou);
        const _admin_dou_new = parseInt(_agent_cash_dou+_admin_dou);
        // 
        await ADMIN.update({ dou: _admin_dou_new }, { where:{
            [Op.and]: [
                { id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        await AGENTCASH.update({ 
            admin_id: id,
            admin_nick: _admin.nick,
            status: 2,
            shtime: time
        }, { where:{
            id: _id
        }, transaction });
        //
        await AdminSums({
            admin_id: id,
            exchange: _agent_cash_dou,
            transaction
        });
        // 日志
        await ADMINLOG.create({
            admin_id: id,
            des: '代理提现 - 审核通过 - '+_agent_cash.agent_id+' - '+nTom(_agent_cash.money)+' 元',
            ip,
            time
        }, { transaction });
        // 金豆明细
        await ADMINDOULOG.create({
            admin_id: id,
            type: 3,
            mode: 2,
            num: _agent_cash_dou,
            dou: _admin_dou_new,
            des: _agent_cash.agent_id+' - '+_agent_cash.agent_nick+' 金豆余额：'+nTom(_admin_dou_new),
            time
        }, { transaction });
        // 
        return {
            agent_id: _agent_cash.agent_id,
            _agent_cash_money: _agent_cash.money,
            _admin_dou_new
        }
    });
    //
    if(!_re || _re==1) {
        return { M:{c:'参数错误，请稍后再试！'} };
    }
    // 
    const _user = await USERS.findOne({attributes: ['uuid'], where:{id: _re.agent_id}});
    if(_user && _user.uuid)
    {
        const _user_id_uuid = _re.agent_id+'-'+_user.uuid;
        await admin_to_user({
            _user_id_uuid,
            data:{
                Msg:{
                    t: '提现审核通过',
                    c: ['合计：'+nTom(_re._agent_cash_money)+' 元'],
                    u: 'agent/dltx'
                }
            }
        });
    }
    // 
    return {
        M:{c:'审核通过，金豆已回收到本账号！'},
        AgentDltxReload: 1,
        Auth:{
            dou: _re._admin_dou_new
        },
    }
}
// 
const cancel = async(d) => 
{
    const { id, ip, time, _id } = d;
    // 
    let _re = await TCL(async(transaction) => 
    {
        const _agent_cash = await AGENTCASH.findOne({
            attributes: ['agent_id','dou','money'], 
            where:{
                id: _id
            }
        }, { transaction });
        const _admin = await ADMIN.findOne({
            attributes: ['nick'], 
            where:{id}
        }, { transaction });
        if(!_agent_cash || !_agent_cash.agent_id || !_agent_cash.dou || !_agent_cash.money || !_admin) throw new Error(1);
        // 
        const agent_id = _agent_cash.agent_id;
        const _agent = await AGENT.findOne({
            attributes: ['dou'], 
            where:{agent_id}
        }, { transaction });
        if(!_agent || !_agent.dou) throw new Error(1);
        //
        const _agent_cash_dou = parseInt(_agent_cash.dou);
        const _agent_dou = parseInt(_agent.dou);
        const _agent_dou_new = parseInt(_agent_cash_dou+_agent_dou);
        // 金豆更新
        await AGENT.update({ dou: _agent_dou_new }, { where:{
            [Op.and]: [
                { agent_id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        // 提现记录
        await AGENTCASH.update({ 
            admin_id: id,
            admin_nick: _admin.nick,
            status: 3,
            shtime: time
        }, { where:{
            id: _id
        }, transaction });
        // 金豆明细
        await AGENTLOGDOU.create({
            agent_id,
            type: 61,
            mode: 2,
            num: _agent_cash_dou,
            dou: _agent_dou_new,
            des: '提现撤销，共 '+nTom(_agent_cash.money)+' 元',
            time
        }, { transaction });
        // 日志
        await ADMINLOG.create({
            admin_id: id,
            des: '代理提现 - 审核取消 - '+agent_id+' - '+nTom(_agent_cash.money)+' 元',
            ip,
            time
        }, { transaction });
        // 
        return {
            agent_id,
            _agent_dou_new,
            _agent_cash_money: _agent_cash.money
        }
    });
    //
    if(!_re || _re==1) {
        return { M:{c:'参数错误，请稍后再试！'} };
    }
    // 
    const _user = await USERS.findOne({attributes: ['uuid'], where:{id: _re.agent_id}});
    if(_user && _user.uuid)
    {
        const _user_id_uuid = _re.agent_id+'-'+_user.uuid;
        await admin_to_user({
            _user_id_uuid,
            data:{
                Auth:{
                    dou: _re._agent_dou_new
                },
                Msg:{
                    t: '提现撤销',
                    c: ['合计：'+nTom(_re._agent_cash_money)+' 元'],
                    u: 'agent/jdmx'
                }
            }
        });
    }
    // 
    return {
        M:{c:'已撤销，金豆已退回到代理账号！'},
        AgentDltxReload: 1
    }
}
// 
module.exports = {
    agree,
    cancel
};