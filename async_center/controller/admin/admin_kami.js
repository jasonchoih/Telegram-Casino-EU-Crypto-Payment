// 
const dayjs = require('dayjs');
const { admin_to_user } = require('../../tool/redis');
const { USERS, USERCARD } = require('../../sequelize/db28');
const { TCL, TCC } = require('../../service/transaction');
// 
const sh = async(d) => 
{
    const { uuidkey, ip, id, status, kami_id, time } = d;
    // 
    const _user_card = await USERCARD.findOne({where:{id:kami_id}});
    // 
    if(!_user_card)
    {
        return {
            M:{c:'Withdrawal does not exist！'}
        }
    }
    // 
    const user_id = _user_card.user_id;
    const _user = await USERS.findOne({attributes: ['id','uuid'],where:{id:user_id}});
    if(!_user)
    {
        return {
            M:{c:'An error occurred during operation, please try again later！'}
        }
    }
    // 
    let _re = await TCL(async(transaction) => 
    {
        await USERCARD.update({ 
            status,
            admin_id: id 
        }, { where:{
            id: kami_id,
            user_id
        }, transaction });
        // 
        return 'ok'
    });
    if(!_re) {
        return { 
            M:{c:'Control failed, please try again later!'},
            ReloadUserCredMdata: dayjs().valueOf() 
        }
    }
    // 
    // const _user_id_uuid = _user.id+'-'+_user.uuid;
    // const __status = {
    //     1: '取消审核！',
    //     2: '卡密审核通过'
    // }
    // await admin_to_user({
    //     _user_id_uuid,
    //     data:{
    //         Msg:{
    //             t: '卡密审核',
    //             c: ['您的卡密已'+__status[status]],
    //             u: 'user/wdkm'
    //         },
    //         UserwdkmReload: dayjs().valueOf()
    //     }
    // });
    // 
    // const _status = {
    //     1: '取消审核成功！',
    //     2: '审核成功！'
    // }
    // 
    return { 
        M:'',
        ReloadUserCredMdata: dayjs().valueOf() 
    }
}
// 
module.exports = {
    sh
};