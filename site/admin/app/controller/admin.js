// 
const dayjs = require('dayjs');
const { enSign, deSign, xPass, UUID } = require('../plugin/cryptos');
const { GotoUrl, xpage, isNull } = require('../plugin/tool');
const { PhoneCheck } = require('../plugin/verify');
const { Op, sequelize, ADMIN, ADMINLOG, OPENLOG } = require('../sequelize/db28');
// 列表
const list = async(d) => 
{
    const { id, user, nick, phone, status, role, page } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(user) where['user'] = user;
    if(nick) where['nick'] = nick;
    if(phone) where['phone'] = phone;
    if(status) where['status'] = status;
    if(role) where['role'] = role;
    // 
    const count = await ADMIN.count({ where });
    const rows = await ADMIN.findAll({
        // attributes: ['user','role','phone','nick','dou','status'],
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    let list = [];
    rows.map((v,k)=>{
        list.push([
            v.id,
            v.role,
            v.user,
            v.nick,
            v.calling || '-',
            v.phone || '-',
            v.dou,
            v.up_max,
            v.status,
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
        ])
    });
    return {
        AdminList: [
            [page, count],
            list
        ],
        AdminListLoading:false
    };
}
// 添加
const add = async(d) => 
{
    const { id,user,pass,role,calling,phone,nick,up_max,status, ip,time } = d;
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    if(_admin.role<=1) return { M:{c:'The customer service account cannot edit or add information, please notify the manager to deal with it!'} };
    // 
    let AdminStatus = {};
    if (!user||!/^[a-zA-Z0-9_]{2,16}$/.test(user)) AdminStatus['user'] = { s: 'error', h: 'The format is a-zA-Z0-9_, length 2-16' };
    if (!nick||!/^[a-zA-Z0-9_\u4E00-\u9FA5]{2,16}$/.test(nick)) AdminStatus['nick'] = { s: 'error', h: '格式为 a-zA-Z0-9_或中文，长度2-16' };
    if (pass&&!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(pass)) AdminStatus['pass'] = { s: 'error', h: '格式为 a-zA-Z0-9_-@.，长度6-26' };
    // if (!up_max||up_max<1000) AdminStatus['up_max'] = { s: 'error', h: '最低为 1,000' };
    // if (!calling||!phone||!await PhoneCheck(calling, phone))
    // {
    //     AdminStatus['calling'] = { s: 'error', h: '区号或错误' };
    //     AdminStatus['phone'] = { s: 'error', h: '区号或错误' };
    // }
    if(user&&await ADMIN.findOne({where:{user}})) AdminStatus['user'] = { s: 'error', h: 'Account already exists' };
    if(calling&&phone&&await ADMIN.findOne({where:{calling,phone}}))
    {
        AdminStatus['calling'] = { s: 'error', h: '区号与手机已存在，请更换' };
        AdminStatus['phone'] = { s: 'error', h: '区号与手机已存在，请更换' };
    }
    if(nick&&await ADMIN.findOne({where:{nick}})) AdminStatus['nick'] = { s: 'error', h: '昵称已存在，请更换' };
    if (Object.keys(AdminStatus).length > 0) return { AdminStatus };
    // 
    let data = { user,role,calling,phone,nick,up_max,status,time };
    data['pass'] = await xPass(pass);
    let _in = await ADMIN.create(data);
    // 日志
    await ADMINLOG.create({
        admin_id: id,
        des: 'Added ID：'+_in.id+' - '+nick,
        ip,
        time
    });
    // 
    return {
        AdminOne:'',
        AdminStatus:'',
        M:{c:'Congratulations, added successfully！'},
        ...await list({page:1})
    }
}
// 查看
const get = async(d) => 
{
    const { _id } = d;
    const AdminOne = await ADMIN.findOne({
        attributes: ['id','user','role','calling','phone','nick','dou','up_max','status'],
        where:{id:_id}
    });
    return {
        AdminOne:{
            ...AdminOne.dataValues,
            role: AdminOne.role+'',
            status: AdminOne.status+''
        }
    }
}
// 更新
const update = async(d) => 
{
    const { id,_id,user,pass,role,calling,phone,nick,up_max,status, ip,time } = d;
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    if(_admin.role<=1) return { M:{c:'Your account cannot edit or add information!'} };
    // 
    const _this_admin = await ADMIN.findOne({where:{id:_id}});
    // 
    let AdminStatus = {};
    if (!user||!/^[a-zA-Z0-9_]{2,16}$/.test(user)) AdminStatus['user'] = { s: 'error', h: 'The format is a-zA-Z0-9_, length 2-16' };
    if (!nick||!/^[a-zA-Z0-9_\u4E00-\u9FA5]{2,16}$/.test(nick)) AdminStatus['nick'] = { s: 'error', h: '格式为 a-zA-Z0-9_或中文，长度2-16' };
    if (pass&&!/^[a-zA-Z0-9\_\-\@\.]{6,26}$/.test(pass)) AdminStatus['pass'] = { s: 'error', h: '格式为 a-zA-Z0-9_-@.，长度6-26' };
    // if (!up_max||up_max<1000) AdminStatus['up_max'] = { s: 'error', h: '最低为 1,000' };
    // if (!calling||!phone||!await PhoneCheck(calling, phone))
    // {
    //     AdminStatus['calling'] = { s: 'error', h: '区号或错误' };
    //     AdminStatus['phone'] = { s: 'error', h: '区号或错误' };
    // }
    if(user&&user!=_this_admin.user&&await ADMIN.findOne({where:{user}})) AdminStatus['user'] = { s: 'error', h: '账号已存在，请更换' };
    if(calling&&phone&&(calling!=_this_admin.calling&&phone!=_this_admin.phone)&&await ADMIN.findOne({where:{calling,phone}}))
    {
        AdminStatus['calling'] = { s: 'error', h: '区号与手机已存在，请更换' };
        AdminStatus['phone'] = { s: 'error', h: '区号与手机已存在，请更换' };
    }
    if(nick&&nick!=_this_admin.nick&&await ADMIN.findOne({where:{nick}})) AdminStatus['nick'] = { s: 'error', h: '昵称已存在，请更换' };
    if (Object.keys(AdminStatus).length > 0) return { AdminStatus };
    // 
    let data = { user,role,calling,phone,nick,up_max,status,time };
    if(pass) data['pass'] = await xPass(pass);
    await ADMIN.update(data,{where:{id:_id}});
    // 
    // 日志
    await ADMINLOG.create({
        admin_id: id,
        des: 'Edited ID：'+_id+' - '+nick,
        ip,
        time
    });
    // 
    return {
        AdminOne:'',
        AdminStatus:'',
        M:{c:'Congratulations, the editing is successful!'},
        ...await list({page:1})
    }
}
// 列表
const log_list = async(d) => 
{
    const { id, admin_id, page } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(admin_id) where['admin_id'] = admin_id;
    // 
    const count = await ADMINLOG.count({ where });
    const rows = await ADMINLOG.findAll({
        // attributes: ['user','role','phone','nick','dou','status'],
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        let _admin = await ADMIN.findOne({attributes:['nick'],where:{id: v.admin_id}});
        // 
        list.push([
            v.id,
            v.admin_id,
            _admin.nick,
            v.des,
            v.ip,
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
        ])
    };
    return {
        AdminLogList: [
            [page, count],
            list
        ],
        AdminLogListLoading:false
    };
}
// 开奖列表
const open_log_list = async(d) => 
{
    const { type, peroids, time_start, time_end, page } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(type) where['type'] = type;
    if(peroids) where['peroids'] = peroids;
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await OPENLOG.count({ where });
    const rows = await OPENLOG.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        // 
        list.push([
            v.admin_id,
            v.admin_nick,
            v.type,
            dayjs(v.time).format('YYYY-MM-DD HH:mm:ss'),
            v.peroids,
            v.des,
        ])
    };
    return {
        OpenLogList: [
            [page, count],
            list
        ],
        OpenLogListLoading:false
    };
}
// 
const getdou = async(d) => 
{
    const { id } = d;
    const _admin = await ADMIN.findOne({ attributes: ['nick', 'role', 'dou', 'status'], where: { id } });
    // 
    return {
        AuthDouLoading:'',
        Auth: {
            id: id,
            nick: _admin.nick,
            role: _admin.role,
            dou: _admin.dou
        }
    }
}
// 
module.exports = {
    list,
    add,
    get,
    update,
    // 
    log_list,
    open_log_list,
    // 
    getdou
};