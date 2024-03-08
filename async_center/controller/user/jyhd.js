// 
const dayjs = require('dayjs');
// const { admin_to_user } = require('../../tool/redis');
const { USERDATA, USERLOGDOU, USEREXPDOU } = require('../../sequelize/db28');
const { nTom } = require('../../tool/tool');
const { TCL,TCC } = require('../../service/transaction');
// 
const go = async(d) => 
{
    let { id, time} = d;
    //
    let _re = await TCL(async(transaction)=>
    {
        const _user_data = await USERDATA.findOne({attributes:['id','dou','exp'],where:{user_id:id}},{transaction});
        // 
        if(!_user_data || !_user_data.exp || _user_data.exp<=0) throw new Error(1);
        // 
        const dou = await getHd(_user_data.exp);
        if(!dou || dou<=0) throw new Error(1);
        // 
        const _user_dou = _user_data.dou ? parseInt(_user_data.dou) : 0;
        const _user_new_dou = parseInt( _user_dou + dou );
        // 
        await USERDATA.update({ dou: _user_new_dou, exp:0 }, { where:{
            id: _user_data.id,
            user_id: id
        }, transaction });
        await USEREXPDOU.create({
            user_id: id,
            exp: _user_data.exp,
            num: dou,
            dou: _user_new_dou,
            time
        }, { transaction });
        await USERLOGDOU.create({
            user_id: id,
            type: 7,
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
    if(!_re || _re==1)
    {
        return {
            M:{c:'兑换失败，稍后再试！'}
        }
    }
    // 
    return {
        M:{c:'兑换完成，金豆已到账！'}, 
        Auth:{dou:_re._user_new_dou,exp:0},
        UserJyhdReload: dayjs().valueOf()
    }
}
// 获取返利金豆
const getHd = async(exp) => 
{
    if(!exp) return 0;
    //
    const expodd = 100; // %
    const _expodd = parseFloat(expodd/100);
    const _exp = parseInt(exp)||0;
    return parseInt(_exp*_expodd);
}
// 
module.exports = {
    go
}