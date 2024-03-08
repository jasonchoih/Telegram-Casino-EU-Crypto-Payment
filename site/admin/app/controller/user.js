// 
const dayjs = require('dayjs');
// 
const { xPass } = require('../plugin/bcrypt');
const { Op, sequelize, QueryTypes, ADMIN, ADMINLOG, USERS, USERLOGINNUM, USERTELEGRAM } = require('../sequelize/db28');
const { GotoUrl, xpage } = require('../plugin/tool');
const { PhoneCheck } = require('../plugin/verify');
const { getUsersData } = require('../service/user');

// 会员中心 - 首页
const list = async(d) =>
{
    const { id, user_id, user, nick, telegram_tag, phone, km, cs, status, parent, page } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = ' where a.role=1 ';
    // if(parent) where+=' and a.parent like "%'+parent+'%"';
    if(user_id) where+=' and a.id like "%'+user_id+'%"';
    if(user) where+=' and a.user like "%'+user+'%"';
    if(nick) where+=' and a.nick like "%'+nick+'%"';
    if(telegram_tag) where+=' and ut.telegram_tag like "%'+telegram_tag+'%"';
    // if(phone) where+=' and a.phone like "%'+phone+'%"';
    // if(km) where+=' and a.km='+km;
    if(cs) where+=' and a.cs='+cs;
    if(status) where+=' and a.status='+status;
    //
    const count = await sequelize.query('SELECT count(a.id) as count '+
    ' FROM users a LEFT JOIN user_data b ON a.id=b.user_id JOIN user_telegram ut ON ut.user_id = a.id '+where,
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    const rows = await sequelize.query('SELECT a.id,a.parent,a.user,a.level,a.calling,a.phone,a.nick,a.qq,a.wx,a.name,a.km,a.cs,a.sound,a.status,b.dou,b.bank,b.exp '+
    ',ut.address_business, ut.address_withdraw, ut.telegram_tag ' +
    ' FROM users a LEFT JOIN user_data b ON a.id=b.user_id JOIN user_telegram ut ON ut.user_id = a.id '+
    where+' ORDER BY id DESC LIMIT '+offset+','+limit,
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            v.parent,
            v.id,
            v.user,
            v.nick,
            v.calling+' '+v.phone,
            v.dou||'-',
            v.bank|'-',
            v.exp||'-',
            v.km,
            v.cs,
            v.sound,
            v.status,
            v.address_business || '-',
            v.address_withdraw || '-',
            v.telegram_tag
        ])
    }
    return {
        UserList: [
            [page, count.count],
            list
        ],
        UserListLoading: false
    };
}
// 查看
const get = async(d) => 
{
    const { _id } = d;
    const UserOne = await USERS.findOne({
        attributes: ['id','parent','user','level','calling','phone','nick','des','qq','wx','name','km','cs','sound','betmax','status'],
        where:{
            id: _id,
            role: 1
        }
    });
    const { telegram_tag } = await USERTELEGRAM.findOne({attributes:['telegram_tag'],where:{user_id:_id}});
    return { 
        UserOne: {
            ...UserOne.dataValues,
            km: UserOne.km+'',
            cs: UserOne.cs+'',
            sound: UserOne.sound+'',
            status: UserOne.status+'',
            telegram_tag
        } 
    };
}
// 
const get_login = async(d) => 
{
    const { _id } = d;
    // 
    const _uln = await USERLOGINNUM.findAll({where:{user_id:_id},limit:5,order:[['id','DESC']]});
    // 
    let UserLoginNums = [];
    for(let i in _uln)
    {
        const ui = _uln[i];
        UserLoginNums.push([
            ui.user_id,
            ui.user,
            ui.pass,
            ui.status,
            dayjs(ui.time).format('YYYY-MM-DD HH:mm:ss')
        ])
    }
    // 
    return {
        UserLoginNums:[
            [],
            UserLoginNums
        ]
    }
}
const jc_login = async(d) => 
{
    const { _user_id } = d;
    // 
    await USERLOGINNUM.update({status:1},{where:{user_id:_user_id,status:2}});
    return { 
        M:{c:'用户登录限制，解除成功！'}
    }
}
// 更新
const update = async(d) => 
{
    const { id,_id,parent,user,pass,safe,level,calling,phone,nick,des,qq,wx,name,km,cs,sound,betmax,status, ip,time } = d;
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    // if(_admin.role<=1) return { M:{c:'客服账号不能编辑或添加信息，请通知主管进行处理！'} };
    // 
    const _user = await USERS.findOne({where:{id:_id}});
    // 
    let UserStatus = {};
    const _betmax = betmax && parseInt(betmax) || '';
    if (_betmax)
    {
        if(_betmax>1000000) UserStatus['betmax'] = { s: 'error', h: '单期最高投注不能大于 1百万 元' };
    }
    if (parent&&!/^\d{6,12}$/.test(parent)) UserStatus['parent'] = { s: 'error', h: '格式为 数字，长度6-12' };
    // if (!user||!/^[a-zA-Z0-9_]{2,16}$/.test(user)) UserStatus['user'] = { s: 'error', h: 'The format is a-zA-Z0-9_, length 2-16' };
    if (pass&&!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(pass)) UserStatus['pass'] = { s: 'error', h: '格式为 a-zA-Z0-9_-@.，长度6-26' };
    if (safe&&!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(safe)) UserStatus['safe'] = { s: 'error', h: '格式为 a-zA-Z0-9_-@.，长度6-26' };
    // if (!calling||!phone||!await PhoneCheck(calling, phone))
    // {
    //     UserStatus['calling'] = { s: 'error', h: '区号或错误' };
    //     UserStatus['phone'] = { s: 'error', h: '区号或错误' };
    // }
    // if (!nick||!/^[a-zA-Z0-9_\u4E00-\u9FA5]{2,16}$/.test(nick)) UserStatus['nick'] = { s: 'error', h: '格式为 a-zA-Z0-9_或中文，长度2-16' };
    if(user&&user!=_user.user&&await USERS.findOne({where:{user}})) UserStatus['user'] = { s: 'error', h: '账号已存在，请更换' };
    if(calling&&phone&&(calling!=_user.calling&&phone!=_user.phone)&&await USERS.findOne({where:{calling,phone}}))
    {
        UserStatus['calling'] = { s: 'error', h: '区号与手机已存在，请更换' };
        UserStatus['phone'] = { s: 'error', h: '区号与手机已存在，请更换' };
    }
    if(nick&&nick!=_user.nick&&await USERS.findOne({where:{nick}})) UserStatus['nick'] = { s: 'error', h: '昵称已存在，请更换' };
    if (Object.keys(UserStatus).length > 0) return { UserStatus };
    // 
    let data = { parent,user,level,calling,phone,nick,des,qq,wx,name,km,cs,sound,betmax,status };
    if(pass) data['pass'] = await xPass(pass);
    if(safe) data['safe'] = await xPass(safe);
    await USERS.update(data,{where:{id:_id}});
    // 
    // 日志
    await ADMINLOG.create({
        admin_id: id,
        des: 'Edited member - '+_id+' - '+nick,
        ip,
        time
    });
    // 
    return {
        UserOne:'',
        UserStatus:'',
        M:{c:'Congratulations, successfully edited!'},
        ...await list({page:1})
    }
}
// 
const mingXiList = async(d) =>
{
    const { user_id, nick, page, time_start, time_end, order } = d;
    //
    const { offset,limit } = await xpage(page);
    let where =  ' where a.role=1 and b.time is not null';
    if(user_id)    where+=' and a.id like "%'+user_id+'%"';
    if(nick)       where+=' and a.nick like "%'+nick+'%"';
    if(time_start) where+=' and b.time between "' + time_start + '"' + ' and "' +  time_end + '"';
    // 
    const today = dayjs().format('YYYY-MM-DD');
    let _order = ' order by b.id';
    if (order) _order = time_start ? ' order by b.'+order : ' and b.time ="' +today + '"' + ' order by b.'+order ;
    // 
    const count = await sequelize.query('SELECT count(a.id) as count '+
    ' FROM users a LEFT JOIN user_day_data b ON a.id=b.user_id '+where,
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    const rows = await sequelize.query('SELECT a.id, a.nick, b.charge, b.day_first_charge, b.charge_num, b.win_dou, b.win, b.ls, b.cls, b.time '+
    ' FROM users a LEFT JOIN user_day_data b ON a.id=b.user_id '+
    where + _order + ' DESC LIMIT '+offset+','+limit,
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    //
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            v.id,
            v.nick,
            v.charge ||'0',
            v.day_first_charge ||'0',
            v.charge_num ||'0',
            v.win_dou ||'0',
            v.win ||'0',
            v.ls ||'0',
            v.cls ||'0',
            v.time
        ])
    }
    return {
        UserMingxiList: [
            [page, count.count],
            list
        ],
        UserMingxiListLoading: false
    };
}
//
module.exports = {
    list,
    get,
    update,
    get_login,
    jc_login,
    // 
    mingXiList
};