// 
const dayjs = require('dayjs');
const { admin_to_user, redis_2_pub } = require('../tool/redis');
const { 
    sequelize,Transaction,Op, USERS, USERDATA, USERLOGDOU, AGENT, AGENTCHARGE ,AGENTLOGDOU,USERDAYDATA,
    USERBET
} = require('../sequelize/db28');
//
const userbetdou = async(user_id) =>
{
    const _time = dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
    const _bd = await USERBET.sum('dou',
    {
        where: {
            user_id,
            status:1,
            time: {
                [Op.gte]: _time
            }
          }
    });
    // console.log(_bd,_time);
    // if(_bd) return _bd;
    // return 0;
};

userbetdou(892146);