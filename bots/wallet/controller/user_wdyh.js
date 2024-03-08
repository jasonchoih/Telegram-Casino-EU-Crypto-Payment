const dayjs = require('dayjs'); 
const { xPass, UUID } = require('../plugin/cryptos');
const { cPass } = require('../plugin/cryptos');
const { SubDo} = require('../plugin/redis');
// 
const { USERS, USERLOG, USERDATA, USERTELEGRAM, USERSUM, sequelize, Sequelize } = require('../sequelize/db28');
const { TCL, TCC } = require('../plugin/transaction');
// 
const cun = async(d) => 
{
    let { num, telegram_id, message_id } = d; 
    // 
    num = parseInt(num*1000);
    // 
    const ut = await USERTELEGRAM.findOne({ attributes: ['user_id'], where: { telegram_id } });
    const _user = await USERS.findOne({ attributes: ['id', 'uuid'], where: { id: ut.user_id } });
    // 
    await SubDo({ 
        path:[ 'user', 'wdyh_cun' ],
        data:{ uuidkey: _user.uuid, id: _user.id, num, telegram_id, message_id }
    });
}
// 
const qu = async(d) => 
{
    let { num, telegram_id, message_id } = d;
    // 
    if (!/^[0-9]{1,15}$/.test(num)) return '请输入金豆数量，格式为数字';
    num = parseInt(num*1000);
    if (!num || num=='0' || num<=0) return '最低输入 1 金豆' ;
    // 
    const ut = await USERTELEGRAM.findOne({ attributes: ['user_id'], where: { telegram_id } });
    const _user = await USERS.findOne({ attributes: ['id', 'uuid'], where: { id: ut.user_id } });
    //
    await SubDo({ 
        path:[ 'user', 'wdyh_qu' ],
        data:{ uuidkey: _user.uuid, id: _user.id, num, telegram_id, message_id }
    });
}
// 
module.exports = {
    cun,
    qu
};