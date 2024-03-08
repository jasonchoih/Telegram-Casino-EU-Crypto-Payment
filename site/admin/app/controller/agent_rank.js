//
const dayjs = require('dayjs'); 
const { AGENTSUM, Op, sequelize, QueryTypes } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getAgentsNick } = require('../service/user');
//
const list = async(d) => 
{
    const { month, day } = d;
    //
    let rows = {};
    if(month) rows = await getMonthSum(month);
    if(day) rows = await getDaySum(day);
    if(!day && !month)
    {
        rows = await AGENTSUM.findAll({
            order: [['rate_sum','DESC']]
        });
    }
    let list = [];
    const _agentnick = await getAgentsNick(rows);
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            (!day && !month) ? dayjs(v.time).format('YYYY-MM-DD HH:mm:ss') : v.times,
            v.agent_id,
            _agentnick[v.agent_id],
            v.charge,
            v.charge_rate,
            v.exchange,
            v.exchange_rate,
            v.rate_sum
        ])
    }
    return {
        AgentRankList: [
            [1, 1],
            list
        ],
        AgentRankLoading: false
    };
}
const getDaySum = async(time) => 
{
    const type = '%Y-%m-%d';
    const AgentSum = await sequelize.query('SELECT '+
    'DATE_FORMAT(time,"'+type+'") as times,agent_id,'+
    'sum(charge) as charge,'+
    'sum(charge_rate) as charge_rate,'+
    'sum(exchange) as exchange,'+
    'sum(exchange_rate) as exchange_rate,'+
    'sum(rate_sum) as rate_sum'+
    " FROM agent_day_data WHERE time like '"+time+"%' GROUP BY agent_id,times ORDER BY rate_sum DESC  ", 
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    return AgentSum;
}
const getMonthSum = async(time) => 
{
    const type = '%Y-%m';
    const AgentSum = await sequelize.query('SELECT '+
    'DATE_FORMAT(time,"'+type+'") as times,agent_id,'+
    'sum(charge) as charge,'+
    'sum(charge_rate) as charge_rate,'+
    'sum(exchange) as exchange,'+
    'sum(exchange_rate) as exchange_rate,'+
    'sum(rate_sum) as rate_sum'+
    " FROM agent_day_data WHERE time like '"+time+"%' GROUP BY agent_id,times ORDER BY rate_sum DESC ", 
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    return AgentSum;
}
// 
module.exports = {
    list
}