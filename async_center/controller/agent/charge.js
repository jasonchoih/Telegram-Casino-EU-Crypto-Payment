// 
const dayjs = require('dayjs');
const { admin_to_user, redis_2_pub, async_get_telegram, get_2 } = require('../../tool/redis');
const { 
    sequelize,Transaction,Op, USERS, USERDATA, USERLOGDOU, AGENT, AGENTCHARGE ,AGENTLOGDOU,USERDAYDATA,
    USERBET, USERTRANSACTION, USERHDFL
} = require('../../sequelize/db28');
const { nTom, oddCheck } = require('../../tool/tool');
const { TCL,TCC } = require('../../service/transaction');
const { agentSumCheck } = require('../../service/agentsum');
const { UserDaySumCheck } = require('../../service/usersum');
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
    if(_bd) return _bd;
    return 0;
};
// 
const go = async(d) => 
{
    const { id, _user_id, money, time, address_business, unit, block, transaction_id } = d;
    // 
    const _agent = await USERS.findOne({attributes: ['nick', 'role', 'status'], where:{id: id}});
    const _user = await USERS.findOne({attributes: ['uuid','nick', 'role', 'status'], where:{id: _user_id}});
    // 
    const num = parseInt(parseInt(money)*1000);
    const _day = dayjs().format('YYYY-MM-DD');
    await agentSumCheck({ agent_id:id, time:_day  });
    await UserDaySumCheck({ user_id:_user_id, time:_day });
    // 
    // ===
    const { start_time, end_time, name, data } = await get_2('HdflDl');
    const _start = dayjs(start_time).diff(dayjs(),'second');
    const _end = dayjs(end_time).diff(dayjs(),'second');
    const { odd } = await oddCheck(data, money);
    // ===
    //
    let _re = await TCL(async(transaction)=>
    {
        const __agent = await AGENT.findOne({
            attributes: ['dou','up_rate','up_max'], 
            where:{agent_id:id}
        }, { transaction });
        //
        // if(money>parseInt(__agent.up_max)) throw new Error(1); // MAX of BOT
        //
        const _ganet_dou = parseInt(__agent.dou);
        const _agent_rate = parseFloat(__agent.up_rate);
        const _agent_need_num = parseInt(num * _agent_rate);
        const agent_rate = parseInt(num - _agent_need_num);
        //
        // if(_ganet_dou<num) throw new Error(2); // BALANCE CHECK
        //
        const __user = await USERDATA.findOne({
            attributes: ['dou','bank','exp'], 
            where:{user_id:_user_id}
        }, { transaction });
        const _user_dou = parseInt(__user.dou);
        //
        const _ganet_new_dou = parseInt(_ganet_dou - _agent_need_num);
        const _user_new_dou = parseInt(_user_dou + num);
        const exp = __user.exp ? parseInt( parseInt(__user.exp) + parseInt(money) ): money;
        //
        // await AGENT.update({ dou: _ganet_new_dou },  UPDATE AGENT balance
        // { where:{ // 
        //     [Op.and]: [
        //         { agent_id: id }, 
        //         { dou: {[Op.gte]: 0} },
        //     ],
        // }, transaction });
        // 
        await USERDATA.update({ 
            dou: _user_new_dou,
            exp,
            last_charge_dou: parseInt(parseInt(__user.dou)+parseInt(__user.bank)+await userbetdou(_user_id))
        }, { where:{
            [Op.and]: [
                { user_id: _user_id }, 
                { dou: {[Op.gte]: 0} },
            ],
        }, transaction });
        // 
        const _charge = await AGENTCHARGE.create({
            agent_id: id,
            agent_nick: _agent.nick,
            user_id: _user_id,
            user_nick: _user.nick,
            money,
            up_rate: _agent_rate,
            agent_cut_dou: _agent_need_num,
            agent_rate,
            time
        }, { transaction });
        await AGENTLOGDOU.create({
            agent_id: id,
            type: 1,
            mode: 1,
            num: _agent_need_num,
            dou: _ganet_new_dou,
            des: _user.nick+' - '+_user_id,
            time
        }, { transaction });
        await USERLOGDOU.create({
            user_id: _user_id,
            type: 5,
            mode: 2,
            num,
            dou: _user_new_dou,
            des: '-',
            time
        }, { transaction });
        // 
        await USERTRANSACTION.create({
            user_id: _user_id,
            charge_id: _charge.id,
            address_business,
            amount: money,
            unit,
            block,
            transaction_id,
            time
        }, { transaction });
        // 
        const _user_day_data = await USERDAYDATA.findOne({attributes:['day_first_charge','cls'],where:{user_id:_user_id,time:_day}});
        let day_first_charge = '';
        if(!_user_day_data || !_user_day_data.day_first_charge || _user_day_data.day_first_charge==0 || _user_day_data.day_first_charge=='0')
        {
            day_first_charge = money;
        }
        // 统计
        await sequelize.query(
            'UPDATE `user_day_data` SET '+
            '`charge`=`charge` + '+money+', '+
            '`cls`=0, '+
            '`cls_last`='+(_user_day_data&&_user_day_data.cls||0)+', '+
            (day_first_charge?'`day_first_charge`= '+day_first_charge+', ':'')+
            '`charge_num`=`charge_num` + 1 '+
            'WHERE user_id='+_user_id+' and time="'+_day+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_sum` SET '+
            '`charge`=`charge` + '+money+', '+
            '`charge_num`=`charge_num` + 1, '+
            '`time`= "'+time+'" '+
            'WHERE user_id='+_user_id, 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `agent_day_data` SET '+
            '`charge`=`charge` + '+money+', '+
            '`charge_rate`=`charge_rate` + '+agent_rate+', '+
            '`rate_sum`=`rate_sum` + '+agent_rate+', '+
            '`charge_num`=`charge_num` + 1 '+
            'WHERE agent_id='+id+' and time="'+_day+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `agent_sum` SET '+
            '`charge`=`charge` + '+money+', '+
            '`charge_rate`=`charge_rate` + '+agent_rate+', '+
            '`rate_sum`=`rate_sum` + '+agent_rate+', '+
            '`charge_num`=`charge_num` + 1, '+
            '`time`= "'+time+'" '+
            'WHERE agent_id='+id, 
            { transaction }
        );
        //  ===
        // 
        if(_start<0 && _end>=0) 
        {
            if(odd >0)
            {
                await USERDATA.update({ 
                    dou: _user_new_dou + (odd*1000)
                }, { where:{
                    [Op.and]: [
                        { user_id: _user_id }, 
                        { dou: {[Op.gte]: 0} },
                    ],
                }, transaction });
                // 
                // 类型 1存豆 2取豆 3投注 4中奖 5代理充值 51代理充值撤回 6开业返利
                // 模式 1扣除 2增加
                await USERLOGDOU.create({
                    user_id: _user_id,
                    type: 6,
                    mode: 2,
                    num: odd*1000,
                    dou: _user_new_dou + (odd*1000),
                    des: name,
                    time
                }, { transaction });
                // 
                // 模式 1活动返利 2月工资
                // 类型 1首充返利 2投注返利 3亏损返利 4推广返利 6开业返利
                await USERHDFL.create({
                    user_id: _user_id,
                    mode: 1,
                    type: 6,
                    num: odd*1000,
                    dou: _user_new_dou + (odd*1000),
                    time
                }, { transaction });
            }
        }
        // ===
        // 
        return {
            _ganet_new_dou,
            _agent_rate,
            _agent_need_num,
            _user_new_dou,
            _charge_id: _charge.id,
            exp 
        }
    });
    if(!_re) return;
    // if(!_re) return '充值失败，请联系客服！';
    // if(_re==1) return '超过最大上分额度，请检查或联系客服更改';
    // if(_re==2) return '金豆余额不足，请联系客服上分';
    // 
    //
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({
        AgentCharge:[
            dayjs().format('MM-DD HH:mm:ss'),
            id,
            _agent.nick,
            money,
            _user_id,
            _user.nick,
            1
        ]
    }));
    // 
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({
        PageView:[
            _user_id,
            _user.nick || '-',
            address_business,
            money,
            transaction_id,
            dayjs().format('MM-DD HH:mm:ss')
        ]
    }));
    redis_2_pub.publish('sd28-admin-data', JSON.stringify({
        HomeSum:{agent_charges:money}
    }));
    // 
    const { network } = await async_get_telegram("environment");
    const promo = (odd > 0 ? "限时活动：" + odd : '') + '\n\n' 
    // 
    return '恭喜您！' + '\n' +
    '您充值了' + money + '美元。感谢您选择在金狼福财公司，祝你好运老板！！' + '\n' +
    promo + 

    '点击"🎮 彩票导航"进入娱乐场！' + '\n\n' + 
    '您的交易哈希：' + network + transaction_id + '';
}
// 
// const back = async(d) => 
// {
//     let { id, _id, time } = d;
//     // 
//     if(!_id || _id<=0) return { M:{c:'撤回失败，请稍后再试！'} };
//     // 
//     const _charge = await AGENTCHARGE.findOne({where:{id:_id}});
//     if(!_charge) return { M:{c:'撤回失败，请稍后再试！'} };
//     if(_charge.status>1) return { M:{c:'已进行过撤回处理，不能重复处理'} };
//     // 获取撤回设置
//     //
//     if(dayjs().diff(_charge.time, 'second')>300) return { M:{c:'已超过 5分钟 撤回时间，请联系客服协助'} };
//     // 
//     if(_charge.agent_id!=id) return { M:{t:'系统警告',c:'因非正常参数导致失败，多次错误操作将会导致账号被冻结，请反馈给客服协助处理！'} };
//     const num = parseInt(parseInt(_charge.money)*1000);
//     if(!num || num<=0) return { M:{c:'撤回充值失败，请刷新页面后再试！'} };
//     //
//     const _day = dayjs().format('YYYY-MM-DD');
//     // 
//     let _re = await TCL(async(transaction)=>
//     {
//         const __user = await USERDATA.findOne({
//             attributes: ['dou','exp'], 
//             where:{user_id: _charge.user_id}
//         }, { transaction });
//         const _user_dou = parseInt(__user.dou);
//         //
//         if(!_user_dou || _user_dou<num)
//         {
//             await AGENTCHARGE.update({ status:2 },{
//                 where:{id: _id}
//             }, { transaction });
//             return 1;
//         }
//         //
//         const __agent = await AGENT.findOne({
//             attributes: ['dou'], 
//             where:{agent_id: id}
//         }, { transaction });
//         const _ganet_dou = parseInt(__agent.dou);
//         //
//         const _agent_cut_dou = parseInt(_charge.agent_cut_dou);
//         const _ganet_new_dou = parseInt(_ganet_dou + _agent_cut_dou);
//         const _user_new_dou = parseInt(_user_dou - num);
//         const exp = parseInt( parseInt(__user.exp) - parseInt(_charge.money) );
//         //
//         await AGENT.update({ dou: _ganet_new_dou }, { where:{
//             [Op.and]: [
//                 { agent_id: id }, 
//                 { dou: {[Op.gte]: 0} },
//             ],
//         }, transaction });
//         await USERDATA.update({ 
//             dou: _user_new_dou,
//             exp
//         }, { where:{
//             [Op.and]: [
//                 { user_id: _charge.user_id }, 
//                 { dou: {[Op.gte]: 0} },
//             ],
//         }, transaction });
//         // 
//         await AGENTCHARGE.update({ status:3 },{
//             where:{id: _id}
//         }, { transaction });
//         await AGENTLOGDOU.create({
//             agent_id: id,
//             type: 11,
//             mode: 2,
//             num: _agent_cut_dou,
//             dou: _ganet_new_dou,
//             des: _charge.user_nick+' - '+_charge.user_id,
//             time
//         }, { transaction });
//         await USERLOGDOU.create({
//             user_id: _charge.user_id,
//             type: 51,
//             mode: 1,
//             num,
//             dou: _user_new_dou,
//             des: _charge.agent_nick,
//             time
//         }, { transaction });
//         // 统计
//         const _day = dayjs(_charge.time).format('YYYY-MM-DD');
//         const _charge_user_id = _charge.user_id;
//         const _charge_money = parseInt(_charge.money);
//         const _charge_agent_rate = parseInt(_charge.agent_rate);
//         // 
//         const _user_day_data = await USERDAYDATA.findOne({attributes:['charge_num','cls_last'],where:{user_id:_charge.user_id,time:_day}});
//         let day_first_charge = false;
//         if(_user_day_data&&_user_day_data.charge_num&&_user_day_data.charge_num==1)
//         {
//             day_first_charge = true;
//         }
//         // 
//         await sequelize.query(
//             'UPDATE `user_day_data` SET '+
//             '`charge`=`charge` - '+_charge_money+', '+
//             (day_first_charge?'`day_first_charge`= "0", ':'')+
//             (_user_day_data&&_user_day_data.cls_last?'`cls`= '+(_user_day_data.cls_last)+', ':'')+
//             '`charge_num`=`charge_num` - 1 '+
//             'WHERE user_id='+_charge_user_id+' and time="'+_day+'"', 
//             { transaction }
//         );
//         await sequelize.query(
//             'UPDATE `user_sum` SET '+
//             '`charge`=`charge` - '+_charge_money+', '+
//             '`charge_num`=`charge_num` - 1, '+
//             '`time`= "'+time+'" '+
//             'WHERE user_id='+_charge_user_id+' and time="'+_day+'"', 
//             { transaction }
//         );
//         await sequelize.query(
//             'UPDATE `agent_day_data` SET '+
//             '`charge`=`charge` - '+_charge_money+', '+
//             '`charge_rate`=`charge_rate` - '+_charge_agent_rate+', '+
//             '`rate_sum`=`rate_sum` - '+_charge_agent_rate+', '+
//             '`charge_num`=`charge_num` - 1 '+
//             'WHERE agent_id='+id+' and time="'+_day+'"', 
//             { transaction }
//         );
//         await sequelize.query(
//             'UPDATE `agent_sum` SET '+
//             '`charge`=`charge` - '+_charge_money+', '+
//             '`charge_rate`=`charge_rate` - '+_charge_agent_rate+', '+
//             '`rate_sum`=`rate_sum` - '+_charge_agent_rate+', '+
//             '`charge_num`=`charge_num` - 1, '+
//             '`time`= "'+time+'" '+
//             'WHERE agent_id='+id, 
//             { transaction }
//         );
//         // 
//         return {
//             _ganet_new_dou,
//             _user_new_dou,
//             __user,
//             exp
//         }
//     });
//     //
//     if(!_re) return { M:{c:'撤回充值失败，请稍后再试！4'} }; 
//     if(_re==1) return { M:{c:'撤回充值失败，用户金额不足以撤回！'} };
//     // 
//     const _user = await USERS.findOne({attributes: ['uuid', 'id','nick'], where:{id: _charge.user_id}});
//     // 
//     redis_2_pub.publish('sd28-admin-data', JSON.stringify({AgentCharge:[
//         dayjs().format('MM-DD HH:mm:ss'),
//         id,
//         _charge.agent_nick,
//         _charge.money,
//         _user.id,
//         _user.nick,
//         2
//     ]}));
//     //
//     // await admin_to_user({
//     //     _user_id_uuid: _user.id+'-'+_user.uuid,
//     //     data:{
//     //         Auth:{
//     //             dou: _re._user_new_dou,
//     //             exp: _re.exp
//     //         },
//     //         Msg:{
//     //             t: '代理撤回充值',
//     //             c: ['合计：'+nTom(num)+' 豆'],
//     //             u: 'user/jdmx'
//     //         }
//     //     }
//     // });
//     // 
//     // return {
//     //     M:{c:'撤回充值成功！'},
//     //     Auth:{dou:_re._ganet_new_dou},
//     //     AgentChargeReload: dayjs().valueOf()
//     // }
// }
// 
module.exports = {
    go
    // back
};