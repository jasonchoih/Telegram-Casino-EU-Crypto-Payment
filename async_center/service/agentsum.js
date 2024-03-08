// 
const dayjs = require('dayjs');
const { AGENTDAYDATA, AGENTSUM } = require('../sequelize/db28');
// 
const agentSumCheck = async(d) => 
{
    const { agent_id, time } = d;
    // 今日总体 
    const _agent_day = await AGENTDAYDATA.findOne({attributes:['id'],where:{agent_id,time}});
    if(!_agent_day)
    {
        await AGENTDAYDATA.create({ 
            agent_id,
            time
        });
    }
    // 总体统计 
    const _agent_sum = await AGENTSUM.findOne({attributes:['id'],where:{agent_id}});
    if(!_agent_sum)
    {
        await AGENTSUM.create({
            agent_id,
            time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        });
    }
}
// 
module.exports = 
{
    agentSumCheck
}