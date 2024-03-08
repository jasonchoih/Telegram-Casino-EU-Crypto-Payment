// 
const { admin_to_user } = require('../../tool/redis');
const { Op, ADMINLOG, ADMIN, ADMINDOULOG, ADMINCHARGE } = require('../../sequelize/db28');
const { nTom } = require('../../tool/tool');
const { TCL, TCC } = require('../../service/transaction');
const { AdminSums } = require('../../service/adminsum');
// 主管为主管充值
const upa = async(d) => 
{
    const { id, _admin_id, money, ip, time } = d;
    // 
    const _money_dou = parseInt( parseInt(money)*1000 );
    // 
    let AdminChargeStatus = {};
    let _re = await TCL(async(transaction) => 
    {
        const _admin = await ADMIN.findOne({where:{id}});
        //
        if(!_admin) throw new Error(1);
        // 
        const _admin_dou = parseInt(_admin.dou);
        const _admin_dou_new = parseInt(_admin_dou+_money_dou);
        // 
        await ADMIN.update({ dou: _admin_dou_new }, { where:{
            [Op.and]: [
                { id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        // 金豆明细
        await ADMINDOULOG.create({
            admin_id: id,
            type: 11,
            mode: 2,
            num: _money_dou,
            dou: _admin_dou_new,
            des: '主管充值，金豆余额：'+nTom(_admin_dou_new),
            time
        }, { transaction });
        // 
        await AdminSums({
            admin_id: _admin_id,
            sys_charge: _money_dou,
            transaction
        });
        // 
        await ADMINCHARGE.create({
            admin_id: id,
            money,
            dou: _money_dou,
            form_admin_id: id,
            time
        }, { transaction });
        // 
        return {
            _admin_dou_new
        };
    });
    if(!_re || _re==1) {
        AdminChargeStatus['money'] = { s: 'error', h: '操作失败，请重试！' } 
        return { AdminChargeStatus }
    }
    // 
    return {
        M:{c:'为主管充值成功！'},
        AdminDouUpKf:'',
        AdminDouUpListReload: 1,
        Auth:{
            dou: _re._admin_dou_new
        },
    }
}
// 为客服充值
const upb = async(d) => 
{
    const { id, _admin_id, money, ip, time } = d;
    // 
    const _money_dou = parseInt( parseInt(money)*1000 );
    // 
    let AdminChargeStatus = {};
    let _re = await TCL(async(transaction) => 
    {
        const _form_admin = await ADMIN.findOne({where:{id}});
        const _admin = await ADMIN.findOne({where:{id:_admin_id}});
        //
        if(!_admin || !_form_admin) throw new Error(1);
        // 
        const _form_admin_dou = parseInt(_form_admin.dou);
        if(_form_admin_dou<_money_dou) throw new Error(2);
        const _admin_dou = parseInt(_admin.dou);
        // 
        const _form_admin_dou_new = parseInt(_form_admin_dou-_money_dou);
        const _admin_dou_new = parseInt(_admin_dou+_money_dou);
        //
        await ADMIN.update({ dou: _form_admin_dou_new }, { where:{
            [Op.and]: [
                { id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        await ADMIN.update({ dou: _admin_dou_new }, { where:{
            [Op.and]: [
                { id: _admin_id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        await AdminSums({
            admin_id: _admin_id,
            admin_charge: _money_dou,
            transaction
        });
        // 金豆明细
        await ADMINDOULOG.create({
            admin_id: id,
            type: 12,
            mode: 1,
            num: _money_dou,
            dou: _form_admin_dou_new,
            des: _admin.id+' - '+_admin.nick,
            time
        }, { transaction });
        await ADMINDOULOG.create({
            admin_id: _admin_id,
            type: 1,
            mode: 2,
            num: _money_dou,
            dou: _admin_dou_new,
            des: _form_admin.id+' - '+_form_admin.nick+' - 金豆余额：'+nTom(_admin_dou_new),
            time
        }, { transaction });
        // 
        await ADMINCHARGE.create({
            admin_id: _admin_id,
            money,
            dou: _money_dou,
            form_admin_id: id,
            time
        }, { transaction });
        // 
        return {
            _form_admin_dou_new
        }
    });
    if(!_re || _re==1) {
        AdminChargeStatus['money'] = { s: 'error', h: '操作失败，请重试！' } 
        return { AdminChargeStatus }
    }
    if(_re==2) {
        AdminChargeStatus['money'] = { s: 'error', h: '您的金豆余额不足，请先为主管充值' } 
        return { AdminChargeStatus }
    }
    // 
    return {
        M:{c:'为客服充值成功！'},
        AdminDouUpKf:'',
        AdminDouUpListReload: 1,
        Auth:{
            dou: _re._form_admin_dou_new
        },
    }
}
// 
module.exports = {
    upa,
    upb
};