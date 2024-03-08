// 
const dayjs = require('dayjs'); 
// 
const { enSign, deSign, xPass, UUID } = require('../plugin/cryptos');
const { TxcaptchaCheck, AlismsSend } = require('../plugin/verify');
const { GotoUrl, phoneHide } = require('../plugin/tool');
const { sequelize, ADMIN, ADMINLOG } = require('../sequelize/db28');
const { ItsmsSend } = require('../plugin/verify_it');

// 登录密钥
const logincode = async(d) => 
{
    const { ticket, randstr, user, pass, ip, time } = d;
    // 
    // const _pass = await xPass(pass);
    // const uuid = await UUID(12);
    // await ADMIN.create({
    //     uuid,
    //     user,
    //     pass: _pass,
    //     role: 3,
    //     calling: 8,
    //     phone: 13123988008,
    //     nick: '管理员1',
    //     dou: 10000,
    //     up_max: 10000,
    //     status: 1,
    //     time
    // });
    // if (!ticket || !randstr || !user || !pass) return { M: { c: '参数不完整，请重试！' }, AuthLoading: false };
    if ( !user || !pass) return { M: { c: 'The parameters are incomplete, please try again!' }, AuthLoading: false };
    // if (!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(user)) return { M: { c: 'The account or password is wrong, please try again!' }, AuthLoading: false };
    // if (!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(pass)) return { M: { c: 'The account or password is wrong, please try again!！' }, AuthLoading: false };
    // if (!await TxcaptchaCheck(randstr, ticket, ip)) return { M: { c: '验证时发生错误，请重试！' }, AuthLoading: false };
    //
    const _admin = await ADMIN.findOne({ attributes: ['id', 'calling', 'phone', 'pass'], where: { user } });
    // console.log(_admin);
    if (!_admin) return { M: { c: 'The account or password is wrong, please correct it！' }, AuthLoading: false };
    //
    // const _calling_phone = _admin.calling+''+_admin.phone;
    // const nopost = ['380506558313'];
    // if (nopost.find(v=>v==_calling_phone)) return { M: { c: '已发送！' }, AuthLoading: false };
    //
    if (await xPass(pass) !== _admin.pass) return { M: { c: 'The account or password is wrong！' }, AuthLoading: false };
    // 
    // let code = await AlismsSend('login', 86, _admin.phone, ip);
    // let code = await AlismsSend('login', _admin.calling, _admin.phone, ip);
    let code = await ItsmsSend('login', _admin.calling, _admin.phone, ip);
    if (code < 0) return { M: { c: '登录验证码发送失败，请稍后再试！' }, AuthLoading: false };
    if (code < 60) return { M: { c: '登录验证码发送过快，请 ' + code + ' 秒后再试！' }, AuthLoading: false };
    // 
    return {
        AuthLoading: false,
        Login: {
            phone: _admin.calling + ' ' + await phoneHide(_admin.phone) + ' ' + code ,
            _code: await enSign(_admin.calling + '|' + _admin.phone + '|' + ip + '|' + code + '|' + dayjs().add(600, 'second').valueOf() + '|' + _admin.id)
        }
    }
};
// 进行登录
const login = async(d) => 
{
    const { _code, code, ip, time, user, pass } = d;
    // if (!_code || !code) return { M: { c: '参数不完整，请重试！' }, PhoneCodeLoading: '' };
    // let PhoneCodeStatus = {};
    // if (!/^\d{6}$/.test(code)) PhoneCodeStatus['code'] = { s: 'error', h: '格式为 6位数字' };
    // ===
    // const _pass = await xPass(pass);
    // // const uuid = await UUID(12);
    // await ADMIN.create({
    //     uuid: await UUID(12),
    //     user,
    //     pass: _pass,
    //     role: 3,
    //     calling: 8,
    //     phone: 13123988008,
    //     nick: '管理员1',
    //     dou: 10000,
    //     up_max: 10000,
    //     status: 1,
    //     time
    // });
    // 
    if (!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(user)) return { M: { c: 'The account or password is wrong, please try again!' }, AuthLoading: false };
    if (!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(pass)) return { M: { c: 'The account or password is wrong, please try again!！' }, AuthLoading: false };
    const _admin = await ADMIN.findOne({ attributes: ['id', 'calling', 'phone', 'pass', 'status', 'role', 'nick', 'dou'], where: { user } });
    if (await xPass(pass) !== _admin.pass) return { M: { c: 'The account or password is wrong！' }, AuthLoading: false };
    let id = _admin.id; 
    // ==
    // let id;
    // try {
    //     let __code = await deSign(_code);
    //     __code = __code.split('|');
    //     id = parseInt(__code[5]);
    //     if (__code[2] != ip || !id || id <= 0) return { M: { c: '验证码在验证时发生错误，请重新登录！' }, Login: '', PhoneCodeStatus: '', PhoneCodeLoading: '' };
    //     if (parseInt(__code[4]) < dayjs().valueOf()) return { M: { c: '验证码已过期，请重新登录！' }, Login: '', PhoneCodeStatus: '', PhoneCodeLoading: '' };
    //     if (__code[3] != code) return { PhoneCodeStatus: { code: { s: 'error', h: '验证码错误，请更正！' } }, PhoneCodeLoading: '' }
    // } catch (error) {

    // }
    // const _admin = await ADMIN.findOne({ attributes: ['nick', 'role', 'dou', 'status'], where: { id } });
    if (!_admin) return { M: { c: 'Error in obtaining user information, please try again!' }, Login: '', PhoneCodeStatus: '', PhoneCodeLoading: '' };
    if (_admin.status > 1) return { M: { c: 'This account has been temporarily frozen. If you have any questions, please contact customer service!' }, Login: '', PhoneCodeStatus: '', PhoneCodeLoading: '' };
    // 
    const uuid = await UUID(12);
    await ADMIN.update({
        uuid
    }, {
        where: { id }
    });
    // 日志
    await ADMINLOG.create({
        admin_id: id,
        des: 'Account Login',
        ip,
        time
    });
    const t = dayjs().valueOf();
    console.log(t)
    // 
    return {
        M: { c: 'Congratulations! Login Successful!', bt:'Continue', bcn:1, b:1, boo:{u:'home'} },
        Auth: {
            id: id,
            nick: _admin.nick,
            role: _admin.role,
            dou: _admin.dou,
            __tk: await enSign(id + '|' + uuid + '|' + ip + '|' + t)
        },
        ...await GotoUrl('home'),
        Login: '',
        PhoneCodeStatus: '',
        PhoneCodeLoading: '',
        AuthLoading:false
    }
};
// 
module.exports = {
    logincode,
    login,
};