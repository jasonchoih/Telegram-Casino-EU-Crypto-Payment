// 
const { sequelize,USERS,USERTGFL } = require('../sequelize/db28');
//
const tgManAdd = async(d) => 
{
    const { user_id,time,transaction } = d;
    // 
    const _user_tgfl = await USERTGFL.findOne({where:{user_id}}, { transaction });
    //
    if(_user_tgfl)
    {
        await USERTGFL.update({
            man: (_user_tgfl.man ? parseInt(_user_tgfl.man)+1 : 1),
            time
        }, {
            where:{ user_id }
        }, { transaction });
    }else{
        const _users = await USERS.findOne({attributes:['role'],where:{id:user_id}}, { transaction });
        await USERTGFL.create({
            user_role: _users.role,
            user_id,
            man: 1,
            bet: 0,
            time
        }, { transaction });
    }
} 
//
const tgBetAdd = async(d) => 
{
    const { user_id,dou,time,transaction } = d;
    // 
    const _user_tgfl = await USERTGFL.findOne({attributes:['id'],where:{user_id}}, { transaction });
    //
    if(_user_tgfl)
    {
        await sequelize.query(
            'UPDATE `user_tgfl` SET '+
            '`bet`=`bet` + '+dou+' '+
            'WHERE id='+_user_tgfl.id, 
            { transaction }
        );
    }
} 
// 
module.exports = 
{
    tgManAdd,
    tgBetAdd
}