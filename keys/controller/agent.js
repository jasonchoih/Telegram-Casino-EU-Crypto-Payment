const { USERS } = require('../sequelize/db28');
const { SubDo } = require('../plugin/redis');
// 
const go = async(d) => 
{
    const { _user_id, money, telegram_id, address_business, event, transaction_id, unit, block } = d;
    // 
    const AGENT_BOT = await USERS.findOne({attributes:['id'], where:{ user: 'AGENT_BOT' }});
    // 
    await SubDo({
        platform: 'agent',
        path:[ 'charge', 'go' ],
        data:{ id: AGENT_BOT.id, _user_id, money, telegram_id, address_business, event, transaction_id, unit, block }
    });
}
// 
module.exports={
    go
}