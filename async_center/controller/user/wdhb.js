// 
const dayjs = require('dayjs');
const { USERDATA, USERLOGDOU, HONGBAO, USERWDHB, USERTELEGRAM } = require('../../sequelize/db28');
const { nTom } = require('../../tool/tool');
const { TCL,TCC } = require('../../service/transaction');
// 
const go = async(d) => 
{
    let { hbm, time,  telegram_id, message_id  } = d;
    // 
    const _hb = await HONGBAO.findOne({where:{hbm}});
    if(!_hb) return '红包码不存在，请检查！';
    if(_hb.status==2 || _hb.status==3 ) return '该红包码已被领取，请更换！';
    if(dayjs().diff(dayjs(_hb.time), 'seconds')>86400) return '该红包码已过期，请更换！';
    // 
    const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'],where:{telegram_id}});
    //
    let _re = await TCL(async(transaction)=>
    {
        const _user_data = await USERDATA.findOne({attributes:['id','dou'],where:{user_id}},{transaction});
        // 
        if(!_user_data) throw new Error(1);
        // 
        const dou = parseInt(_hb.dou);
        // 
        const _user_dou = _user_data.dou ? parseInt(_user_data.dou) : 0;
        const _user_new_dou = parseInt( _user_dou + dou );
        // 
        await USERDATA.update({ dou: _user_new_dou }, { where:{
            id: _user_data.id,
            user_id
        }, transaction });
        await HONGBAO.update({ status: 2 }, { where:{
            id: _hb.id
        }, transaction });
        await USERWDHB.create({
            user_id,
            hongbao_id: _hb.id,
            hbm: _hb.hbm,
            num: dou,
            dou: _user_new_dou,
            time
        }, { transaction });
        await USERLOGDOU.create({
            user_id,
            type: 8,
            mode: 2,
            num: dou,
            dou: _user_new_dou,
            time
        }, { transaction });
        // 
        return {
            _user_new_dou
        }
    });
    // 
    if(!_re || _re==1) return '领取失败，稍后再试！';
    // 
    return '红包领取完成，金豆已到账！';
}
// 
module.exports = {
    go
}