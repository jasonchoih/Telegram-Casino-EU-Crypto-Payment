const dayjs = require('dayjs');
// const { admin_to_user } = require('../tool/redis');
const { USERDATA, USERLOGDOU, USERHDFL, USERTGFL, USERDAYDATA } = require('../sequelize/db28');
const { UserDaySumCheck } = require('../service/usersum');
const { getHdfl, getYgz } = require('../service/hdfl');
const { nTom } = require('../tool/tool');
const { TCL,TCC } = require('../service/transaction');
// 
const _names = {
    'HdflScfl': ['首充返利',61,1,'scfl'],
    'HdflTzfl': ['投注返利',62,2,'tzfl'],
    'HdflKsfl': ['亏损返利',63,3,'ksfl'],
    'HdflXxfl': ['下线推广',64,4,'xxfl']
}
// 
const go = async() => 
{
    const yestoday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    // 
    const user_id = 1;
    // 
    const { ls, day_first_charge } = await USERDAYDATA.findOne({attributes:['ls', 'day_first_charge'],where:{user_id}})
    //
    const { UserHdfl, UserHdflSum } = await getHdfl({ user_id, yestoday });
    // console.log({ls, day_first_charge, ...UserHdfl, ...UserHdflSum});
};

go();