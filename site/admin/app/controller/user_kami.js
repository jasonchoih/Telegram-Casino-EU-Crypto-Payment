// 
const dayjs = require('dayjs');
const { USERCARD, USERTELEGRAM, USERS, USERTRANSACTION, AGENTTRANSACTION, sequelize, QueryTypes } = require('../sequelize/db28');
const { xpage } = require('../plugin/tool');
const { getUsersNick, getAdminsNick, getAgentsNick } = require('../service/user');
const { SubDo, get_2, lpush_2, async_get_telegram } = require('../plugin/redis');
const TronWeb = require('tronweb');
const { Telegraf } = require('telegraf');
// 
const { deriveHDWallet } = require('../service/bot');
const { getAccountToken } = require('../service/crypto');
// 
const sh = async(d) => 
{
    const { uuidkey, ip, id, status, kami_id } = d;
    // 
    if(![1,2].find(v=>v==status))
    {
        return {M:{c:'Incorrect card password status, please try again later.！'}}
    }
    // 
    await SubDo({ 
        path:[ 'admin_kami', 'sh' ],
        data:{ uuidkey, ip, id, status, kami_id }
    });
}
//
const list = async(d) => 
{
    const { user_id, page, status } = d;
    //
    const { offset,limit } = await xpage(page);
    let where = {};
    if(user_id) where['user_id'] = user_id;
    if(status) where['status'] = status;
    // 
    const count = await USERCARD.count({ where });
    const rows = await USERCARD.findAll({
        where,
        order: [['id','DESC']],
        offset,
        limit
    });
    // const _usersnick = await getUsersNick(rows);
    const _adminsnick = await getAdminsNick(rows);
    const _agentsnick = await getAgentsNick(rows);
    let list = [];
    for(let i in rows)
    {
        let v = rows[i];
        list.push([
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
            v.id,
            v.user_id,
            v.user_name,
            // _usersnick[v.user_id]||'-',
            v.money,
            v.km,
            v.rate,
            v.status,
            _adminsnick[v.admin_id]||'-',
            _agentsnick[v.agent_id]||'-',
        ])
    }
    return {
        UserKamiList: [
            [page, count],
            list
        ],
        UserKamiListLoading:false
    };
}
// 
const getLiveUSDTBalance = async(d) =>
{
    if(!d) return 0;
    try {
        const { address_business } = d;
        // 
        const tokenBalance = await getAccountToken(address_business);
        const balance = tokenBalance.data.items.length > 0 ? tokenBalance.data.items[0].confirmedBalance : 0;
        return {
            LiveBalance: Number(balance).toFixed(2),
            LiveBalanceLoading: false
        }
    } catch (error) {
        return {
            LiveBalanceLoading: false,
            LiveBalanceError: 1
        }
    }
    
}
// 
const searchUsdtWallet = async(d) =>
{
    if(!d) return;
    const { address_business } = d;
    // 
    const w = await USERTELEGRAM.findOne({attributes:['address_business'], where:{address_business}})
    if(!w) return { LiveBalanceLoading: false, LiveBalance:'', LiveBalanceError: 1 }
    const tokenBalance = await getAccountToken(w.address_business);
    const balance = tokenBalance.data.items.length > 0 ? tokenBalance.data.items[0].confirmedBalance : 0;
    return {
        SearchWallet: w.address_business,
        LiveBalance: Number(balance).toFixed(2),
        LiveBalanceLoading: false,
        LiveBalanceError: false
    }
}
// 
const getUSDTWallet = async(d) =>
{
    const { user_id } = d;
    const { address_withdraw } = await USERTELEGRAM.findOne({attributes:['address_withdraw'], where:{ user_id }});
    // // 
    const { wallet } = await get_2('WalletSet');
    // // 
    // const rows = await USERTELEGRAM.findAll({
    //     attributes:['address_business']
    // });
    // // 
    // const list = []
    // for(let i in rows)
    // {
    //     const v = rows[i];
        // const tokenBalance = await getAccountToken(v.address_business);
        // const balance = tokenBalance.data.items.length > 0 ? tokenBalance.data.items[0].confirmedBalance : 0;
    //     //    
    //     list.push({
    //         label: v.address_business + ' ($' + Number(balance).toFixed(2) + ')',
    //         value: v.address_business,
    //         balance: Number(balance)
    //     })
    // }
    // // 
    // const finance = (list.sort((a, b) => b.balance - a.balance).slice(0,5));
    // 
    const rows_in = await sequelize.query(`
        SELECT      address_business,
                    SUM(amount) AS sum_in
        FROM        user_transaction
        GROUP BY    address_business
        HAVING SUM(amount) > 0
        ORDER BY    sum_in DESC
        LIMIT 5
        `,
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    // 
    const rows_out = await sequelize.query(`
        SELECT      address_agent,
        SUM(amount) AS sum_out
        FROM        agent_transaction
        GROUP BY    address_agent
        HAVING SUM(amount) > 0;
        `,
    {
        type: QueryTypes.SELECT,
        plain: false,
    });
    // 
    const list = [];
    if(Object.keys(rows_out).length==0){
        for(let i in rows_in){
            const v = rows_in[i];
            list.push({
                label: v.address_business + ' ($' + (v.sum_in || 0).toFixed(2) + ')',
                value: v.address_business,
                balance: Number(v.sum_in || 0)
            })
        }
    }
    else{
        for(let i in rows_in)
        {
            const v = rows_in[i];
            for(let j in rows_out)
            {
                const n = rows_out[j];
                if(v.address_business == n.address_agent)
                {
                    const balance = Number(Number(v.sum_in) - Number(n.sum_out)).toFixed(2)
                    list.push({
                        label: v.address_business + ' ($' + balance + ')',
                        value: v.address_business,
                        balance
                    })
                }else{
                    list.push({
                        label: v.address_business + ' ($' + (v.sum_in || 0).toFixed(2) + ')',
                        value: v.address_business,
                        balance: Number(v.sum_in || 0)
                    })
                }
            }
        }
    }
    const finance = (list.sort((a, b) => b.balance - a.balance));
    // 
    return {
        TRX:{
            receiver: address_withdraw,
            senders: finance,
            sender: wallet
        },
        LiveBalanceError: false   
    }
}
// 
const goUSDT = async(d) =>
{
    const { privateKey, sender, receiver, tokenAmount, user_id, user_name, user_card_id, amount, km } = d;
    // console.log(d)
    // 
    try {
        const { network, contract, trongrid_key, explorer } = await async_get_telegram("environment");
        // console.log({
        //     network, contract, trongrid_key, explorer 
        // })
        // 
        const tronWeb = new TronWeb({ 
            fullHost: network, 
            privateKey,
            "TRON-PRO-API-KEY" : trongrid_key
        });
        // 
        const { abi } = await tronWeb.trx.getContract(contract);
        const contract_abi = tronWeb.contract(abi.entrys, contract);
        const balance = await contract_abi.methods.balanceOf(sender).call();
        // console.log(balance.toString())
        // 
        if(tokenAmount>parseInt(balance.toString())) return ({ M:{c:"Wallet has insufficient funds!"}});
        // 
        const hash = await contract_abi.methods.transfer(receiver, tokenAmount).send();
        if(!hash) {
            return {
                M: {c:'Something went wrong with transfer, please try again!'}
            }
        }
        // 
        const agent = await USERS.findOne({attributes:['uuid', 'id', 'name'],where:{user:"AGENT_BOT"}});
        // 
        await lpush_2('sd28_sub_do_list', JSON.stringify({ 
            path:[ 'exchange', 'go' ],
            data:{ 
                uuidkey: agent.uuid, 
                id: agent.id, 
                kmilist: [{
                    agent_id: agent.id,
                    user_id,
                    user_name,
                    user_card_id,
                    km,
                    money: amount
                }],
                kmdou: amount* 1000, 
                kmsum: amount,
                sender,
                receiver,
                hash
            },
            platform: 'agent',
        }));
        // 
        const { telegram_id } = await USERTELEGRAM.findOne({attributes:['telegram_id'], where:{ user_id }});
        // 
        const walletKey = await async_get_telegram('myWalletBot');
        const wallet = new Telegraf(walletKey.wallet);
        // 
        const customer_thanks = '提现成功，老板请查询！您满意，请告诉别人，不满意请告诉我们期待您的再次光临！' + '\n\n' + explorer + hash;
        // 
        await wallet.telegram.sendMessage(telegram_id, customer_thanks, { parse_mode: 'HTML' });
        // 
        return { 
            M:{ 
                t: 'Transaction Hash',
                c: explorer + hash
            }
        }
        // 
    } catch (error) {
        // console.log(error)
       return { M:{ c: 'Please make sure the provided information is correct!' }}
    }  
}
// 
const transferUSDT = async (d)  =>
{
    if(!d) return;
    // 
    const { receiver, amount, man_sender, sender, man_priv_key, mode, km, user_id, user_card_id, user_name } = d;
    // 
    if(amount <=0) return { M:{ c: 'Amount cannot be zero!' }};
    if(!receiver) return { M:{ c:'The receiver cannot be empty!'}};
    // 
    const tokenAmount = amount * 1_000_000;
    // 
    if(mode=="Manual")
    {
        if(!man_sender || !man_priv_key) return { M:{ c: 'Please provide complete information for Sender and Private Key!' }};
        return await goUSDT({
            privateKey: man_priv_key, 
            sender: man_sender, 
            receiver, 
            amount,
            tokenAmount, 
            user_id,
            user_card_id,
            km,
            user_name,
            mode
        })
    }
    // 
    if(mode=="Automatic")
    {
        const creds = await get_2('WalletSet');
        if(!creds) return { M:{ c: 'No wallet credentials found! Please configure this in settings' }}
        if(!creds.wallet || !creds.priv_key) return { M:{ c: 'Wallet credentials incomplete! Please configure this in settings' }}
        // 
        const { wallet, priv_key } = creds;
        return await goUSDT({
            privateKey: priv_key,
            sender: wallet,
            receiver,
            amount,
            tokenAmount, 
            user_id,
            user_card_id,
            km,
            user_name,
            mode
        })

    }
    if(mode=="Selection")
    {
        const ut = await USERTELEGRAM.findOne({attributes:['user_id'], where:{address_business:sender}})
        if(!sender) return { M:{ c: 'The Sender cannot be empty!' }};
        return await goUSDT({
            privateKey: (await deriveHDWallet(ut.user_id)).substring(2),
            sender,
            receiver,
            amount,
            tokenAmount, 
            user_id,
            user_card_id,
            km,
            user_name,
            mode
        })
    }
}
//
module.exports = {
    sh,
    list,
    getUSDTWallet,
    transferUSDT,
    getLiveUSDTBalance,
    searchUsdtWallet
};