const { SubDo } = require('../plugin/redis');
// 
const go = async(d) => 
{
    const { hbm, telegram_id, message_id } = d;
    // 
    await SubDo({
        platform: 'user',
        path: [ 'wdhb', 'go' ],
        data: { hbm, telegram_id, message_id }
    });
}
// 
module.exports ={
    go
}