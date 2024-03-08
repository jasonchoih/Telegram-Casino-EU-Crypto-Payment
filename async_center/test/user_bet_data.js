// 
const dayjs = require('dayjs');
// 
const { sequelize,Op, USERS, USERDATA, USERBET, USERLOGDOU, USERBETAUTO } = require('../sequelize/db28');
const { admin_to_user, redis_2_pubs } = require('../tool/redis');
const { nTom,GameName,percent, objNumSum } = require('../tool/tool');
const { getGameBetData, UserBetDataCheck, UserDaySumCheck } = require('../service/usersum');
const { TCL } = require('../service/transaction');
// 
const test = async() =>
{
    const _user_bets = await USERBET.findAll({where:{user_id:890996}})
    // console.log(_user_bets);
    let _up = {};
    for(let i in _user_bets)
    {
        let v = _user_bets[i]
        // _up[v.id] = {
        //     id: v.id,
        //     user_id: v.user_id,
        //     category: v.category,
        //     type: v.type,
        //     vals: v.vals,
        //     dou: v.dou,
        //     _dou: (await objNumSum(JSON.parse(v.vals)))['dou']
        // }
        await USERBET.update({
            dou: (await objNumSum(JSON.parse(v.vals)))['dou']
        },{ 
            where:{
                id: v.id,
                user_id: 890996
            }
        });
    }
    // console.log(_up);
};
test();