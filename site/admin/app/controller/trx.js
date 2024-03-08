const dayjs = require('dayjs');
const { Op, sequelize, QueryTypes, USERTRANSACTION, AGENTTRANSACTION } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { async_get_telegram, async_set_telegram } = require('../plugin/redis');
const { deriveHDWallet } = require('../service/bot');
const TronWeb = require('tronweb');
// 
const { getAccountToken } = require('../service/crypto');
// 
const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf('6841749014:AAF-Q-yfCSOQQtDICZ-HOssCYKUmwXdEn0g');
// 
const maskString = (str) =>
{  
    if(!str) return 'Not Found';
    const maskedChars = '*'.repeat(str.length - 4);
    return str.slice(0, 3) + maskedChars;
}
// 
const incoming = async(d) => 
{
    const {  user_id, address_business, amount, block, transaction_id, page, time_start, time_end } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(user_id) where['user_id'] = user_id;
    if(address_business) where['address_business'] = address_business;
    if(amount) where['amount'] = amount;
    if(block) where['block'] = block;
    if(transaction_id) where['transaction_id'] = transaction_id;
    // 
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await USERTRANSACTION.count({ where });
    const rows = await USERTRANSACTION.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    // 
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        list.push([ 
            v.id,
            v.user_id,
            v.address_business,
            v.amount,
            v.unit,
            v.block,
            v.transaction_id,
            dayjs(v.time).format('YY-MM-DD HH:mm:ss')
        ])
    }
    return {
        TrxIncomingList: [
            [page, count],
            list
        ],
        TrxIncomingListLoading: false
    };
}
// 
const outgoing = async(d) => 
{
    const { agent_id, address_agent, address_customer, amount, transaction_id, page, time_start, time_end } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(agent_id) where['agent_id'] = agent_id;
    if(address_agent) where['address_agent'] = address_agent;
    if(address_customer) where['address_customer'] = address_customer;
    if(amount) where['amount'] = amount;
    if(transaction_id) where['transaction_id'] = transaction_id;
    // 
    if(time_start)
    {
        where['time'] = {
            [Op.gte]: time_start,
            [Op.lte]: time_end,
        };
    }
    // 
    const count = await AGENTTRANSACTION.count({ where });
    const rows = await AGENTTRANSACTION.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    // 
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        list.push([ 
            v.id,
            v.address_agent,
            v.address_customer,
            v.amount,
            v.transaction_id,
            dayjs(v.time).format('YY-MM-DD HH:mm:ss')
        ])
    }
    return {
        TrxOutgoingList: [
            [page, count],
            list
        ],
        TrxOutgoingListLoading: false
    };
}
// 
const balance = async(d) =>
{  
    const { user_id, address_business, telegram_id, page, time_start, time_end } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = " where u.role = 1 ";
    if(user_id) where+= ` and ut.user_id like '%${user_id}%'`;
    if(address_business) where+= ` and ut.address_business like '%${address_business}%'`;
    if(telegram_id) where+= ` and ut.telegram_id like '%${telegram_id}%'`;
    // 
    const { network, contract, trongrid_key } = await async_get_telegram("environment");
    // 
    const { count } = await sequelize.query(`
        SELECT      count(*)
        FROM        user_telegram ut 
        JOIN        users u 
        ON          ut.user_id = u.id
        ${where}
    `,
    {
        type: QueryTypes.SELECT,
        plain: true,
    });
    const rows = await sequelize.query(`
    SELECT  ut.id,
            ut.user_id,
            ut.telegram_id,
            ut.telegram_tag,
            u.nick,
            ut.address_business
    FROM    user_telegram ut  
    JOIN    users u 
    ON      ut.user_id = u.id
    ${where}
    ORDER BY ut.id
    LIMIT ${offset}, ${limit}`,
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    // 
    const agentSum = async(user_id) => 
    {
        if(!user_id) return 0;
        const time = dayjs().format('YYYY-MM');
        // 
        let where = ` where user_id = ${user_id} `;
        if(time_start) {
            where+=` and time between "${time_start}:00" and  "${time_end}:00"`
        }
        else where += ` and time like "${time}%"`;
        // 
        const { sum } = await sequelize.query(`
            SELECT  sum(money) as sum
            FROM    agent_charge
            ${where}
        `,
        {
            type: QueryTypes.SELECT,
            plain: true,
        });
        if(!sum) return 0;
        return sum;
    }
    // // ==========================================================================================
    // TRONWEB (FREE)
    let list = [];
    // for(let i in rows)
    // {
    //     let v = rows[i];
    //     const privateKey = (await deriveHDWallet(v.user_id)).substring(2);
    //     // 
    //     const tronWeb = new TronWeb({ 
    //         fullHost: network, 
    //         privateKey,
    //         // "TRON-PRO-API-KEY" : trongrid_key  || '' 
    //     });
    //     const { abi } = await tronWeb.trx.getContract(contract);
    //     const contract_abi = tronWeb.contract(abi.entrys, contract);
    //     const balance = await contract_abi.methods.balanceOf(v.address_business).call();
    //     // 
    //     list.push([ 
    //         v.user_id,
    //         v.telegram_id,
    //         v.nick,
    //         v.address_business,
    //         (balance/1_000_000).toFixed(2),
    //         await agentSum(v.user_id),
    //         maskString(privateKey)
    //     ])
    // }
    // ==========================================================================================
    // CRYPTO (PAID)
    for(let i in rows)
    {
        let v = rows[i];
        const privateKey = (await deriveHDWallet(v.user_id)).substring(2);
        // 
        const tokenBalance = await getAccountToken(v.address_business);
        const balance = tokenBalance.data.items.length > 0 ? tokenBalance.data.items[0].confirmedBalance : 0
        list.push([ 
            v.user_id,
            v.telegram_id,
            v.telegram_tag,
            v.nick,
            v.address_business,
            (Number(balance)).toFixed(2),
            await agentSum(v.user_id),
            maskString(privateKey)
        ])
    }
    // 
    // ==========================================================================================
    return {
        TrxBalanceList: [
            [page, count],
            list
        ],
        TrxBalanceListLoading: false
    };
}
// 
const getkey = async(d) =>
{
    const { telegram_id, wallet, id, user_id, admin_nick, ip, time } = d;
    // 
    const privateKey = (await deriveHDWallet(user_id)).substring(2);
    const tokenBalance = await getAccountToken(wallet);
    const balance = tokenBalance.data.items.length > 0 ? tokenBalance.data.items[0].confirmedBalance : 0
    // 
    const text = 'Срактіман облікового запису <b>' + admin_nick + '</b> запитує доступ до закритого ключа гаманця <code>' + wallet  + '</code>' + '\n\n' +

    'Телеграма ID: ' + telegram_id + '\n' +
    'Адреса гаманця: <code>' + wallet + '</code>' + '\n' +
    'Баланс: $' + Number(balance).toFixed(2)  + '\n' +
    'Приватний ключ: <code>' + privateKey + '</code>' + '\n' +
    'ідентифікатор користувача: ' + id + '\n' +
    'Ім\'я користувача: ' + admin_nick + '\n\n' +
    'IP-адреса: ' + ip + '\n' +
    'час: ' + time + '\n' ;
    // 
    await async_set_telegram('private_key_permission', ({
        telegram_id,
        wallet,
        balance,
        privateKey,
        id,
        user_id,
        admin_nick,
        ip,
        time
    }))
    // 6780606562
    bot.telegram.sendMessage(6780606562, text, { 
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            Markup.button.callback("Дозволити ", "Approve_key"),
            Markup.button.callback("Відкинути", "Reject_key")
          ])
    });
}
// 
module.exports={
    incoming,
    outgoing,
    balance,
    getkey
}