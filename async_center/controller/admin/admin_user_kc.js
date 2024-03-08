// 
const { admin_to_user } = require('../../tool/redis');
const { Op, USERS, USERDATA, USERLOGDOU, USERLOGBANK, ADMIN, ADMINDOULOG } = require('../../sequelize/db28');
const { nTom } = require('../../tool/tool');
const { TCL } = require('../../service/transaction');
// 
const dou = async(d) => 
{
    let { id, _user_id, dou, ip, time } = d;
    dou = parseInt(dou);
    if(!dou || dou=='undefined' || dou=='null' || dou<=0) return { M:{c:'Format error!'} };
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    if(!_admin) return { M:{c:'An error occurred - 1!'} };
    const _admin_dou = parseInt(_admin.dou);
    const _user = await USERS.findOne({where:{id: _user_id}});
    if(!_user) return { M:{c:'An error occurred - 2!'} };
    const _user_data = await USERDATA.findOne({where:{user_id: _user_id}});
    if(!_user_data) return { M:{c:'An error occurred - 3!'} };
    // 
    const _user_data_dou = parseInt(_user_data.dou);
    if(_user_data_dou<=0) return { M:{c:"The user's balance is 0 and cannot be deducted!"} };
    if(dou>_user_data_dou) return { M:{c:"The user's balance is not enough for deduction!"} };
    // 
    const _user_dou_new = parseInt(_user_data_dou - dou);
    const _admin_dou_new = parseInt( _admin_dou + dou );
    //
    let _re = await TCL(async(transaction) => 
    {
        // 用户金豆更新
        await USERDATA.update({ dou: _user_dou_new }, { where:{
            [Op.and]: [
                { user_id: _user_id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        // 客服金豆更新
        await ADMIN.update({ dou: _admin_dou_new }, { where:{
            [Op.and]: [
                { id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        // 客服金豆明细
        await ADMINDOULOG.create({
            admin_id: id,
            type: 4,
            mode: 2,
            num: dou,
            dou: _admin_dou_new,
            des: 'Dedecuted from '+_user.id+' - '+_user.nick+' amount：'+nTom(_user_dou_new),
            time
        }, { transaction });
        // 用户金豆明细
        await USERLOGDOU.create({
            user_id: _user_id,
            type: 9,
            mode: 1,
            num: dou,
            dou: _user_dou_new,
            time
        }, { transaction });
        // 
        return 'ok';
    });
    // 
    if(!_re) {
        return { M:{c:'Deduction failed, please try again later!'} }
    }
    // 
    // const _user_id_uuid = _user_id+'-'+_user.uuid;
    // await admin_to_user({
    //     _user_id_uuid,
    //     data:{
    //         Auth:{ dou: _user_dou_new },
    //         Msg:{
    //             t: '客服扣除',
    //             c: ['合计：'+nTom(dou)+' 豆'],
    //             u: 'user/jdmx'
    //         }
    //     }
    // });
    //
    return {
        M:{c:"The user's balance has been deducted successfully, and has been returned to this account!"},
        KcStatus:'',
        KcLoading: 1,
        Auth:{
            dou: _admin_dou_new
        },
    }
}
// 
const bank = async(d) => 
{
    let { id, _user_id, dou, ip, time } = d;
    dou = parseInt(dou);
    if(!dou || dou=='undefined' || dou=='null' || dou<=0) return { M:{c:'Format error!'} };
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    if(!_admin) return { M:{c:'An error occurred - 1!'} };
    const _admin_dou = parseInt(_admin.dou);
    const _user = await USERS.findOne({where:{id: _user_id}});
    if(!_user) return { M:{c:'An error occurred - 2!'} };
    const _user_data = await USERDATA.findOne({where:{user_id: _user_id}});
    if(!_user_data) return { M:{c:'An error occurred - 3!'} };
    // 
    const _user_data_bank = parseInt(_user_data.bank);
    if(_user_data_bank<=0) return { M:{c:"The user's bank's balance is 0 and cannot be deducted!"} };
    if(dou>_user_data_bank) return { M:{c:"The user's balance is not enough for deduction!"} };
    // 
    const _user_bank_new = parseInt(_user_data_bank - dou);
    const _admin_dou_new = parseInt( _admin_dou + dou );
    //
    let _re = await TCL(async(transaction) => 
    {
        // 用户金豆更新
        await USERDATA.update({ bank: _user_bank_new }, { where:{
            [Op.and]: [
                { user_id: _user_id }, 
                { bank: {[Op.gte]: 0} },
            ],
        }, transaction });
        // 客服金豆更新
        await ADMIN.update({ dou: _admin_dou_new }, { where:{
            [Op.and]: [
                { id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        // 客服金豆明细
        await ADMINDOULOG.create({
            admin_id: id,
            type: 4,
            mode: 2,
            num: dou,
            dou: _admin_dou_new,
            des: 'Deducted '+_user.id+' - '+_user.nick+' Bank amount：'+nTom(_user_bank_new),
            time
        }, { transaction });
        // 用户银行金豆明细
        await USERLOGBANK.create({
            user_id: _user_id,
            type: 4,
            num: dou,
            dou: _user_data.dou,
            bank: _user_bank_new,
            time
        }, { transaction });
        // 
        return 'ok';
    });
    // 
    if(!_re) {
        return { M:{c:'Deduction failed, please try again later!'} }
    }
    // 
    // const _user_id_uuid = _user_id+'-'+_user.uuid;
    // await admin_to_user({
    //     _user_id_uuid,
    //     data:{
    //         Auth:{ bank: _user_bank_new },
    //         Msg:{
    //             t: '客服扣除',
    //             c: ['合计：'+nTom(dou)+' 豆'],
    //             u: 'user/wdyh'
    //         }
    //     }
    // });
    //
    return {
        M:{c:"The user's bank balance is deducted successfully, and the amount has been returned to this account"},
        KcStatus:'',
        KcLoading: 1,
        Auth:{
            dou: _admin_dou_new
        },
    }
}
//
module.exports = {
    dou,
    bank
};