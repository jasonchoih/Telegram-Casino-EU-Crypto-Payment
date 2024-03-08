// 
const dayjs = require('dayjs');
const { redis_2_pub } = require('../../tool/redis');
const { sequelize, Op, AGENT, USERCARD, AGENTCARD, AGENTLOGDOU, AGENTTRANSACTION } = require('../../sequelize/db28');
const { nTom } = require('../../tool/tool');
const { TCL,TCC } = require('../../service/transaction');
const { agentSumCheck } = require('../../service/agentsum');
// 
const go = async(d) => 
{
    const { 
        id, kmilist, kmdou, kmsum ,
        sender, receiver, hash
    } = d;
    // 
    // if(!kmilist || kmilist.length<=0 || kmdou<=0 || kmsum<=0) return {M:{c:'Internal withdrawal failed, please try again later!'}, AgentCardLoading:''};
    // 代理统计检查
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const _day = dayjs().format('YYYY-MM-DD');
    await agentSumCheck({ agent_id: id, time: _day });
    //
    let _re = await TCL(async(transaction)=>
    {
        const _agent = await AGENT.findOne({
            attributes: ['dou','down_rate'], 
            where:{agent_id:id}
        }, { transaction });
        //
        const _agent_dou = parseInt(_agent.dou);
        const _agent_down_rate = parseFloat(_agent.down_rate);
        const _agent_add_rate = parseFloat( 1 - _agent_down_rate );
        const _agent_rete = parseInt( kmdou * _agent_add_rate ); // 代理赚的总手续费
        const _agent_add_dou = parseInt( kmdou +  _agent_rete );
        const _agent_new_dou = parseInt( _agent_dou + _agent_add_dou );
        // 
        let kmids = [];
        let _new_list = [];
        for(let i in kmilist)
        {
            const _kmi = kmilist[i];
            const _money = parseInt(_kmi.money)*1000;
            _new_list.push({
                down_rate: _agent_down_rate,
                agent_add: parseInt( _money * (1+(1-_agent_down_rate)) ),
                agent_rate: parseInt( _money * (1-_agent_down_rate) ),
                time,
                ..._kmi
            });
            kmids.push(_kmi.user_card_id);
        }
        // 
        await AGENTCARD.bulkCreate(_new_list, { transaction });
        // await AGENT.update({ dou: _agent_new_dou }, { where:{   // verify
        //     [Op.and]: [
        //         { agent_id: id }, 
        //         { dou: {[Op.gte]: 0} },
        //     ],
        // }, transaction });
        await AGENTLOGDOU.create({
            agent_id: id,
            type: 2,
            mode: 2,
            num: _agent_add_dou,
            dou: _agent_new_dou,
            des: 'Withdrawed '+kmilist.length+' times with amount $'+nTom(kmsum),
            time
        }, { transaction });
        await USERCARD.update({ 
            status: 3,
            agent_id: id
        }, { where: { id: kmids }, transaction });
        // 更新统计
        await sequelize.query(
            'UPDATE `agent_day_data` SET '+
            '`exchange`=`exchange` + '+kmsum+', '+
            '`exchange_rate`=`exchange_rate` + '+_agent_rete+', '+
            '`rate_sum`=`rate_sum` + '+_agent_rete+', '+
            '`exchange_num`=`exchange_num` + 1 '+
            'WHERE agent_id='+id+' and time="'+_day+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `agent_sum` SET '+
            '`exchange`=`exchange` + '+kmsum+', '+
            '`exchange_rate`=`exchange_rate` + '+_agent_rete+', '+
            '`rate_sum`=`rate_sum` + '+_agent_rete+', '+
            '`exchange_num`=`exchange_num` + 1, '+
            '`time`= "'+time+'" '+
            'WHERE agent_id='+id, 
            { transaction }
        );
        // 
        await AGENTTRANSACTION.create({
            agent_id: id,
            address_agent: sender,
            address_customer: receiver,
            amount: kmsum,
            transaction_id: hash,
            time
        }, { transaction });
        // 
        return {
            _agent_new_dou
        }
    });
    // 
    // if(!_re || _re==100) return {M:{c:'Internal withdrawal failed, please try again later!'}, AgentCardLoading:''}; 
    //
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({
        KamiHuoshouReload:1,
        ReloadUserCredMdata:dayjs().valueOf()
    }));
    // 
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({
        PageRequest:[
            sender,
            receiver,
            kmsum,
            hash,
            dayjs().format('MM-DD HH:mm:ss')
        ]
    }));
    // 
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({  HomeSum: {
        agent_exchanges: kmsum}
    }));
    // 
    return hash

}
//
// const test = async()=>
// {
//     const a = await go({
//         kmilist: [
//             {
//                 agent_id: 2,
//                 user_id: 1,
//                 user_name: 'jason',
//                 user_card_id: 1,
//                 km:'500-SdrWfK6AWFGfvJxjOd44',
//                 money: 500
//         }
            
//         ], 
//         kmdou: 500000, 
//         kmsum: 500,
//         id: 2
//     })
//     console.log(a)
// }
// // 
// test()
// 
module.exports = {
    go
};