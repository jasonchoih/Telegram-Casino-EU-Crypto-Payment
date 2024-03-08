const dayjs = require('dayjs'); 
const { LsCheck } = require('../service/liushui');
const { SubDo } = require('../plugin/redis');
// 
const { USERS, USERDATA, USERTELEGRAM, AGENTCHARGE } = require('../sequelize/db28');
const { TCL, TCC } = require('../plugin/transaction');
const { nTom , mTon } = require('../utils/tool');
// 
const check = async(d) => 
{
    const { telegram_id } = d;
    // 
    const { user_id, address_withdraw } = await USERTELEGRAM.findOne({attributes:['user_id', 'address_withdraw'], where:{telegram_id}});
    const _address_withdraw = address_withdraw ?  '<code>' + address_withdraw + '</code>' : '<b>未设置</b>';
    const _user = await USERS.findOne({ attributes: ['role', 'status', 'cs', 'nick', 'name'], where: { id: user_id  } });
    // 
    if (!_user) return '获取用户信息错误，请稍后再试！';
    if (_user.role == 2) return  '该账号不能进行卡密兑换，请检查！';
    if (_user.cs == 2) return '该账号为测试账号，不能进行卡密兑换，请更换！';
    if (_user.status > 1) return '该账号已暂时被冻结，如有疑问请联系客服！';
    // 
    const _userdata = await USERDATA.findOne({attributes:['dou', 'bank'],where:{user_id}});
    // 金额检查
    // 时间检查
    // let _last_charge_second = 0;
    // const _last_charge = await AGENTCHARGE.findOne({attributes:['time'],where:{user_id,status:1},order:[['id','DESC']]});
    // if(_last_charge&&_last_charge.time)
    // {
    //     _last_charge_second = parseInt(await dayjs().diff(dayjs(_last_charge.time), 'second'));
    // }
    // const _need_time = await get_shop_need_time();
    // if(_last_charge_second>0 && _last_charge_second<_need_time[0])
    // {
    //     return '提现时间间隔，不能低于最后一次充值时间的 '+_need_time[1]+' 分钟内';
    // }
    // 
    let [ ls, tip, odd, charge_dou, _user_data_last_charge_dou ] = await LsCheck({user_id});
    // 
    const text = '您当前余额为：' + nTom(_userdata.dou)  + " 金豆" + '\n' +
    "当前银行余额：" + nTom(_userdata.bank) + " 金豆" + '\n' +
    "有效流水：" + nTom(ls) + " 金豆\n" +
    "当前充值：" + nTom(charge_dou) + " 金豆\n" +
    "充前余额：" + nTom(_user_data_last_charge_dou) + " 金豆" + "\n\n" +

    '🏧 手续费' + '\n' +
    '🔹 无流水：<b>5%</b>' + '\n' +
    '🔹 流水小于1倍：<b>3%</b>' + '\n' +
    '🔹 流水小于2倍：<b>2%</b>' + '\n' +
    '🔹 流水小于3倍：<b>1%</b>' + '\n' +
    '🔹 流水大于3倍：<b>免手续费</b>'+ '\n' +
    '🔹 单日提现5次以上：<b>1%</b>' + '\n\n' +

    '您提现地址为：<code>' + _address_withdraw + '</code>' + '\n' +
    '请仔细核对提现地址和上方图片的地址是否完全一致' + '\n' +
    '如不一致请停止提现 否则一切后果自负' + '\n' +
    '如果地址不对请点击🛠 设置按钮重新设置' + '\n\n' +
    '确认要提现到该地址请输入金额:';
    // 
    return {
        text,
        photo:'',
        user_id
    }
}
// 
const confirm_check = async(d) =>
{
    const { money, user_id } = d;
    // 
    let [ ls, tip, odd, charge_dou, _user_data_last_charge_dou ] = await LsCheck({ user_id });
    // 
    const dou = parseInt(money*1000);
    const rate = parseInt(odd*100);
    const douodd = parseInt(dou*odd);
    const dousum = parseInt(dou+douodd);
    // 
    const { address_withdraw } = await USERTELEGRAM.findOne({attributes:['user_id', 'address_withdraw'], where:{user_id}});
    // 
    const text = "兑换状态：" + tip + "\n\n" +
    "提现金额：<b>" + nTom(money) + "</b> 美元" + "\n" + 
    "需手续费：<b>" + nTom(rate) + "</b>% \n" +
    "提现金豆：<b>" + nTom(dou) + "</b> 金豆\n" +
    "提现费率：<b>" + nTom(douodd) + "</b> 金豆\n" +
    "金豆合计：<b>" + nTom(dousum) + "</b> 金豆\n\n" + 
    "您的提款地址：" + "<b>" + address_withdraw + "</b>";
    // 
    return text
}
// 
const exchange = async(d) => 
{
    const { money, telegram_id, message_id } = d;
    
    const { user_id } = await USERTELEGRAM.findOne({attributes:['user_id'], where:{telegram_id}});
    const { uuid } =  await USERS.findOne({attributes:['uuid'], where:{id: user_id}});
    const id = user_id;
    // 
    await SubDo({ 
        path:[ 'shop', 'dui' ],
        data:{ uuidkey: uuid, id, money, telegram_id, message_id }
    });
}
// 
module.exports={
    check,
    confirm_check,
    exchange
}