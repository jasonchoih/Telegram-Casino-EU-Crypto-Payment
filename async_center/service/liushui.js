// 
const dayjs = require('dayjs'); 
const { USERDATA, USERDAYDATA, AGENTCHARGE } = require('../sequelize/db28');
// 
const charge_dou_odd = async(dou, odd, _last) => 
{
    return parseInt(parseInt(parseInt(dou)+parseInt(_last))*odd);
}
// 
const LsCheck = async(d) => 
{
    const { user_id, transaction } = d;
    // 
    const _user_data = await USERDATA.findOne({attributes:['last_charge_dou'],where:{user_id}});
    const _user_data_last_charge_dou = _user_data&&_user_data.last_charge_dou || 0;
    // 
    const _user_charge = await AGENTCHARGE.findOne({attributes:['money'],where:{user_id},order:[['id','DESC']]}, { transaction });
    // if(!_user_charge) return 0.05;
    //
    const time = dayjs().format('YYYY-MM-DD');
    const _user_day = await USERDAYDATA.findOne({attributes:['cls','exchange_num'],where:{user_id,time}}, { transaction });
    // 没有投注记录
    if(!_user_day||_user_day.cls<=0) return 0.05;
    // 
    const _user_charge_money = (_user_charge&&_user_charge.money) ? parseInt(_user_charge.money) : 0;
    const charge_dou = parseInt(_user_charge_money*1000);
    //
    const _user_day_ls = parseInt(_user_day.cls);
    // 
    if(_user_day_ls <= await charge_dou_odd(charge_dou, 1, _user_data_last_charge_dou)) return 0.03;
    if(_user_day_ls <= await charge_dou_odd(charge_dou, 2, _user_data_last_charge_dou)) return 0.02;
    if(_user_day_ls <= await charge_dou_odd(charge_dou, 3, _user_data_last_charge_dou)) return 0.01;
    // exchange_num
    if(parseInt(_user_day.exchange_num)>5) return 0.01;
    // 
    if(_user_day_ls > await charge_dou_odd(charge_dou, 3, _user_data_last_charge_dou)) return false;
    // 
    return 0.05;
}
// 
module.exports = {
    LsCheck
}