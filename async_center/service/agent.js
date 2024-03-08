// 
const { AGENTDAYDATA } = require('../sequelize/db28');
//
// 更新投注情况
const AgentDataIn = async(d) => 
{
    const { agent_id,transaction } = d;
    // 
    const time = dayjs().format('YYYY-MM-DD');
    //
    const _agent_day = await AGENTDAYDATA.findOne({where:{agent_id,time}}, { transaction });
    if(_agent_day)
    {
        let _updata_agent_day_data = { bet: parseInt(_agent_day.bet)+dou };
        if(_is_ls==1) _updata_agent_day_data['ls'] = parseInt(_agent_day.ls)+dou;
        await AGENTDAYDATA.update(_updata_agent_day_data, {
            where:{ id: _agent_day.id }
        }, { transaction });
    }else{
        let _create_agent_day_data = {
            user_id,
            bet: dou,
            time
        };
        await AGENTDAYDATA.create(_create_agent_day_data, { transaction });
    }
}
// 
module.exports = 
{
    AgentDataIn
}