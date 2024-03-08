//
const dayjs = require('dayjs');
const { TCL,TCC } = require('../../service/transaction');
const { USERS, USERDATA, USERLOG, USERSUM } = require('../../sequelize/db28');
const { tgManAdd } = require('../../service/usertgfl');
// 
// 手动投注
const register = async(d) => 
{
    let { id, uuid, user, pass, safe, parent, calling, phone, nick, ip, time } = d;
    // 
    let _re = await TCL(async(transaction)=>
    {
        const _users = await USERS.create({
            uuid,
            user,
            pass,
            safe,
            parent,
            calling,
            phone,
            nick
        }, { transaction });
        // 数据
        await USERDATA.create({
            user_id: _users.id
        }, { transaction });
        // 日志
        await USERLOG.create({
            user_id: _users.id,
            des: '账号注册',
            ip,
            time
        }, { transaction });
        // 用户统计
        await USERSUM.create({
            user_id: _users.id,
            time
        }, { transaction });
        // 推广人数
        if(parent)
        {
            await tgManAdd({
                user_id: parent,
                time,
                transaction
            })
        }
        //
        return { _users };
    });
    // 
    if(!_re || _re==100) return {M:{c:'注册失败，请稍后再试！'}};
    //
    if (!_re._users) return { M: { c: '注册时发生错误，请稍后再试！' } };
    const _users = _re._users;
    return {
        M: { c: '恭喜您！注册成功！', b:1, bt:'点击跳转至会员中心', bcn:1, boo:{u:'user'} },
        Auth: {
            id: _users.id,
            nick: _users.nick,
            role: _users.role,
            dou: 0,
            exp: 0,
            __tk: await enSign(_users.id + '|' + _users.uuid + '|' + ip)
        },
        RegisterLoading: '',
        RegisterStatus: '',
        Register: ''
    }
}
// 
module.exports = {
    register
}