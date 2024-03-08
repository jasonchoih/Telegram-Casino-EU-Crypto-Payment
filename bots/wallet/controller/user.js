const dayjs = require('dayjs'); 
const { xPass, cPass, UUID } = require('../plugin/cryptos');
const { deriveHDWallet, generateUsdtQR } = require('../service/bot');
// 
const { USERS, USERLOG, USERDATA, USERTELEGRAM, USERSUM, sequelize, Sequelize } = require('../sequelize/db28');
const { TCL, TCC } = require('../plugin/transaction');
const { nTom , mTon } = require('../utils/tool');
const { LsCheck } = require('../service/liushui');
const { async_get_telegram } = require('../plugin/redis');
const { createEventSubTokenConfirmed } = require('../service/webhook');
const TronWeb = require('tronweb');
// 
const register = async(d) => 
{
    const { telegram_id, is_bot, first_name, username } = d;
    // 
    const _pass = await xPass(telegram_id.toString());
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    // 
    const re = await TCL(async(transaction)=> {
        const _users = await USERS.create({
            uuid: await UUID(8),
            user: telegram_id,
            pass: _pass,
            // safe: _pass,
            // calling: '86',
            // phone: telegram_id,
            nick: first_name || telegram_id,
            name: username || telegram_id
        },{ transaction });
        // 
        const user_id = _users.id;
        // 
        const result = await sequelize.query('SHOW TABLE STATUS LIKE "user_telegram"', {
            type: Sequelize.QueryTypes.SELECT
        });
        const { address_business } = await USERTELEGRAM.create({
            telegram_id,
            address_business: await deriveHDWallet(result[0].Auto_increment),
            user_id,
            telegram_tag: username || telegram_id,
            bot: is_bot ? 1 : 2
        },{ transaction });
        // 
        await USERDATA.create({
            user_id
        },{ transaction });
        // 
        await USERLOG.create({
            user_id,
            des: 'Registration',
            // ip,
            time
        },{ transaction });
        // 
        await USERSUM.create({
            user_id,
            time
        },{ transaction });
        // 
        return {
            address_business
        }
    });
    // 
    const { address_business } = re;
    // 
    // DELETE OLD ONES!
    // ADD AGENT!
    const ev = await createEventSubTokenConfirmed({
        walletAddress: address_business, 
        callbackURL: 'https://wbk.mgmwss.com/wbk'
    })
    await USERTELEGRAM.update({
        confirmed_event: ev.data.item.referenceId ? ev.data.item.referenceId : 'ERROR'
        // unconfirmed_event :
    },{ where : { address_business } })
};
// 
const me = async(d) =>
{
    const { telegram_id } = d;
    // 
    const { telegram_tag, address_business, user_id } = await USERTELEGRAM.findOne({ attributes: ['telegram_tag', 'address_business', 'user_id' ], where: { telegram_id } });
    const userData = await USERDATA.findOne({ attributes: ['dou', 'bank', 'exp'], where: { user_id } });
    // 
    const photo = await generateUsdtQR(address_business);
    // 
    let [ ls, tip, odd, charge_dou, _user_data_last_charge_dou ] = await LsCheck({ user_id });
    // 
    return {
        photo,
        text: '<b>👤 金狼福财钱包</b> \n' + // <========= name
        '🔸<b>用户编号</b>：<code>' + telegram_id + '</code> \n' +
        '🔸<b>用户名称</b>：@' + telegram_tag + '\n' +
        '🔸<b>钱包地址</b>：点击可复制 \n' +
        '<code>'+ address_business +'</code> \n' +
        '🔸<b>金豆余额：</b>' + nTom(userData.dou) + '\n' +
        '🔸<b>银行金豆：</b>' + nTom(userData.bank) + '\n' +
        // '🔸<b>经验：</b>' + userData.exp + '\n' +
        '🔸<b>有效流水：</b>' + nTom(ls) + '\n' 
    }
}
// 
const show_USDT = async(d) =>
{
    const { telegram_id, is_bot, first_name, username } = d;
    // 
    const { address_business } = await USERTELEGRAM.findOne({attributes:['address_business'], where:{telegram_id}});
    // 
    const photo = await generateUsdtQR(address_business);
    // 
    return {
        photo,
        text: '💰 充值专属钱包地址: 点击可复制 \n'  +
        '<code>'+ address_business + '</code>' + '\n' +
        '------------------------- \n' + 
        '请仔细比对地址，如果和图片中地址不一致，请停止充值，立即重新安装飞机软件。'
    }
}
// 
const settings_USDT = async(d) =>
{
    const { address_withdraw, telegram_id } = d;
    // 
    // const { network } = await async_get_telegram("environment");
    // const tronWeb = new TronWeb({ 
    //     fullHost: network
    // });
    // if(!await tronWeb.isAddress(address_withdraw)) return "地址格式不正确，请输入合法的USDT-TRC20地址！";
    // 
    await USERTELEGRAM.update({ address_withdraw }, { where:{ telegram_id }})
    return '提现地址设置成功！';
}
// 
const settings_safe = async(d) =>
{
    const { safe, telegram_id } = d;
    // 
    const isSixDigits = /^\d{6}$/.test(safe);
    if(!isSixDigits) return '安全码错误 未6位数字';
    // 
    const { user_id } = await USERTELEGRAM.findOne({ attributes: ['user_id'], where: { telegram_id } });
    // 
    const _pass = await xPass(safe);
    // 
    await USERS.update({
        safe: _pass
    },
    {
        where:{ id: user_id }
    })
    return '您的安全码已设置成功!';
}
// 
const isSafePassword = async(d) =>{
    const { telegram_id, safe } = d;
    // 
    const isSixDigits = /^\d{6}$/.test(safe);
    if(!isSixDigits) return '安全码错误 未6位数字';
    // 
    const { user_id } = await USERTELEGRAM.findOne({ attributes: ['user_id' ], where: { telegram_id } });
    const _user = await USERS.findOne({ attributes: ['safe'], where: { id: user_id } });
    if(!await cPass(safe,_user.safe)) return '安全码错误';
    return 1
}
// 
module.exports={
    register,
    show_USDT,
    settings_USDT,
    settings_safe,
    me,
    isSafePassword
}