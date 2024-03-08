// 
const dayjs = require('dayjs');
const { USERS, USERLOG, USERDATA, USERTELEGRAM, USERSUM, AGENT, AGENTSUM, ADMINLOG, ADMIN } = require('./sequelize/db28');
const { TCL, TCC } = require('./plugin/transaction');
const { xPass, UUID } = require('./plugin/cryptos');
const { SubDo } = require('./plugin/redis');
// 
require('dotenv').config();
//
const TronWeb = require('tronweb');
const tronWeb = new TronWeb({
  // fullHost: 'https://api.nile.trongrid.io',
  fullHost: 'https://nile.trongrid.io',
  // headers: { 'TRON-PRO-API-KEY': '3fbf75b9-1b9d-43a7-a2ad-13f2b13dfd33' },
  privateKey: 'DA0B369A196B9B143D3AF4BD925C01EE4A2E10BB86C55B5D078194E2F6CA29E1'
});
// 
const { register } = require('./controller/user');
// 
const registerAgent = async(d) => 
{  
    // 
    const _pass = await xPass('321321');
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let data = { 
        user: 'AGENT_BOT',
        pass: _pass,
        // calling: 86,
        // phone: '12345678',
        nick: 'AGENT BOT',
        des: 'AGENT BOT FOR USDT TRC-20',
        qq: null,
        wx: null,
        name: 'AGENT BOT',
        cs: 1,
        status: 1,
        parent: null
    };
    // 
    let _re = await TCC(async(transaction)=>
    {
        const _users = await USERS.create({
            uuid: await UUID(8),
            user: data.user,
            pass: data.pass,
            safe: data.pass,
            parent: data.parent,
            calling: data.calling,
            phone: data.phone,
            nick: data.nick
        },{ transaction });
        // 
        if(!_users) throw new Error(100);
        // 数据
        await USERDATA.create({
            user_id: _users.id
        },{ transaction });
        // 日志
        await USERLOG.create({
            user_id: _users.id,
            des: 'AGENT_BOT Creation',
            // ip,
            time
        },{ transaction });
        // 用户统计
        await USERSUM.create({
            user_id: _users.id,
            time
        },{ transaction });
        // 
        return {
            _users
        }
    });
    // if(!_re||_re==100) return {M:{c:'注册失败，请稍后再试！'},RegisterLoading:''}
    //
    const { _users } = _re;
    // console.log(_users)
    // 
    data['role'] = 2;
    // if(pass) data['pass'] = await xPass(pass);
    await USERS.update(data,{where:{id:_users.id}});
    await AGENT.create({
        agent_id: _users.id,
        dou: 0,
        up_rate: 1,
        down_rate: 1,
        ph: 1000000,
        up_max: 1000000,
        status: 1
    });
    // 代理统计
    await AGENTSUM.create({
        agent_id: _users.id,
        time
    });
    // 日志
    await ADMINLOG.create({
        admin_id: 1,
        des: 'Add agent - '+_users.id+' - '+ data.nick,
        // ip:,
        time
    });
};
// 
const registerAdmin = async() =>
{
    const uuid = await UUID(12);
    const _pass = await xPass('Sraktistrator');
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    // 
    await ADMIN.create({
        uuid,
        user: 'SRAKTISTRATOR',
        pass: _pass,
        role: 3,
        // calling: 8,
        // phone: 13123988008,
        nick: 'SRAKTISTRATOR',
        dou: 0,
        up_max: 10000,
        status: 1,
        time
    });
}
// 
const upAdmin = async(d) => 
{
    let { uuidkey, id, _admin_id, money, ip } = d;
    console.log(d)
    // 
    // if(!_admin_id)
    // {
    //     return {M:{c:'请先选择客服！'}};
    // }
    // // 
    // money = await moneyToNumber(money);
    // // 
    // if(!money || money<=0)
    // {
    //     return {M:{c:'金额错误，请稍后再试！'}};
    // }
    // // 
    // if(id!==1)
    // {
    //     return {M:{c:'该账号不能进行客服上分，请联系主管！'}};
    // }
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    // if(!_admin)
    // {
    //     return {M:{c:'参数错误，请稍后再试！'}};
    // }
    const _admin_dou = parseInt(_admin.dou);
    const _money_dou = parseInt( parseInt(money)*1000 );
    // if(id!=_admin_id && _admin_dou<_money_dou)
    // {
    //     return {M:{c:'主管余额不足，请先为主管充值！'}};
    // }
    // 
    const ab = (id==_admin_id&&id==1) ? 'upa' : 'upb';
    // console.log(ab)
    // 
    // await SubDo({ 
    //     platform: 'admin',
    //     path:[ 'admin_charge', ab ],
    //     data:{ uuidkey, id, _admin_id, money, ip }
    // });
    // console.log(a)
}
// 
const upAgent = async(d) => 
{
    const { uuidkey,id, agent_id,money, ip } = d;
    // 
    // let AgentDouUpUpStatus = {};
    // if(!money||money<1)
    // {
    //     AgentDouUpUpStatus['money'] = { s: 'error', h: '上分金额必须填写，且最低为 1 元' };
    //     return { AgentDouUpUpStatus };
    // }
    // 
    const _admin = await ADMIN.findOne({where:{id}});
    // if(parseInt(parseInt(_admin.dou)/1000)<money)
    // {
    //     AgentDouUpUpStatus['money'] = { s: 'error', h: '您的金豆余额不足，请先联系主管充值 - 1' };
    //     return { AgentDouUpUpStatus };
    // }
    // if(_admin.role<=1) return { M:{c:'客服账号不能编辑或添加信息，请通知主管进行处理！'} };
    // 
    const _user = await USERS.findOne({attributes: ['id','uuid'],where:{id:agent_id}});
    // if(!_user) return { M:{c:'缺少信息，请联系技术员或重试！1'} };
    // const _agent = await AGENT.findOne({attributes: ['id'],where:{agent_id}});
    // if(!_agent) return { M:{c:'缺少信息，请联系技术员或重试！2'} };
    // 
    const _user_id_uuid = _user.id+'-'+_user.uuid;
    //
    await SubDo({ 
        platform: 'admin',
        path:[ 'agent_dou_up', 'up' ],
        data:{ uuidkey, _user_id_uuid, id, agent_id, money, ip }
    });
}
// 
// const sendTrx = async() =>
// {
//   try {
//     const contract = await tronWeb.contract().at(process.env.TRC20_CONTRACT);
//     // 
//     let result = await contract.transfer(
//         "TAGHjVCiJpY3h8GRW67ni4HDcwPyd1Fxdv",
//         1
//     ).send({ feeLimit: 1000000 })
//     console.log(result)

//   } catch (error) {
//     console.log(error)
//   }
// }
// 
const test = async()=>{
    await registerAgent();
    // await registerAdmin();
    
    const uuidkey = 'GiJMRhe8vNlxei4Zyv1ldp13';
    const agent_id = 1;
    // 556daf45db9d57f6d24c2db3fe917489
    // // 
    // await upAdmin({
    //     id: 1, 
    //     _admin_id:1, 
    //     uuidkey,
    //     money:10000, 
    //     // ip
    // })
    // await upAgent({
    //     uuidkey,
    //     id: 1, 
    //     agent_id,
    //     money: 10000, 
    //     // ip
    // })
    // 
    // for(let i = 1; i < 5; i++){
    //     const s = 5473524553;
    //     await register({
    //         telegram_id: (s+i), 
    //         is_bot: 1, 
    //         first_name : 'fn'+ (s+i), 
    //         username: 'u'+ (s+i)
    //     })
    // }
    // await sendTrx();
}
test();