require('dotenv').config();
// 
const { promisify } = require("util");
const redis = require("redis");
// 
const client_tx = redis.createClient({
    port: 6379,
    host: '127.0.0.1',
    password: process.env.REDIS_PASSWD,
    db: 5
});
// 
const set_telegram = promisify(client_tx.set).bind(client_tx);
const get_telegram = promisify(client_tx.get).bind(client_tx);
// 
const async_set_telegram = async(n, d) => 
{
    return await set_telegram(n, JSON.stringify(d));
}
// 
const async_get_telegram = async(name) => 
{
    const d = await get_telegram(name);
    if(!d) return '';
    return JSON.parse(d);
}
// 
// const { people } = require('./bots');
// 
const myGameBots = 
{
    'jnd': {
        bot: process.env.GROUP_BOT_JND,
        group_chat_id: process.env.GROUP_PUBLISH_JND
    },
    'jnc': {
        bot: process.env.GROUP_BOT_JNC,
        group_chat_id: process.env.GROUP_PUBLISH_JNC
    },
    'btc': {
        bot: process.env.GROUP_BOT_BTC,
        group_chat_id: process.env.GROUP_PUBLISH_BTC
    },
    'kr': {
        bot: process.env.GROUP_BOT_KR,
        group_chat_id: process.env.GROUP_PUBLISH_KR
    },
    // DOUBLE CHECK BEFORE SAVE, WILL AFFECT PROD
    'slfk':{
        bot: process.env.GROUP_BOT_SLOVAKIA,
        group_chat_id: process.env.GROUP_PUBLISH_SLOVAKIA
    },
    'elg':{
        bot: process.env.GROUP_BOT_OREGON,
        group_chat_id: process.env.GROUP_PUBLISH_OREGON
    },
    'au':{
        bot: process.env.GROUP_BOT_TOKEN_AU,
        group_chat_id: process.env.GROUP_PUBLISH_ID_AU
    },
    'dd':{
        bot: process.env.GROUP_BOT_EGG,
        group_chat_id: process.env.GROUP_PUBLISH_EGG
    },
    'bj':{
        bot: process.env.GROUP_BOT_BINGO,
        group_chat_id: process.env.GROUP_PUBLISH_BINGO
    },
    // 
    'pk':{
        bot: process.env.GROUP_BOT_PK,
        group_chat_id: process.env.GROUP_PUBLISH_PK
    }
}
// 
const updateBots = async() =>
{
    // WALLET BOT
    // await async_set_telegram('myWalletBot', {
    //     wallet: process.env.WALLET_BOT
    // });
    // 
    // FOR LOOP GROUP BET
    // await async_set_telegram('myGameBots', myGameBots);
    // 
    // BLACK WOLF
    // await async_set_telegram('black_wolf', process.env.BLACK_WOLF_BOT)

    // 
    // ==========================================================
    // TRONWEB
    // // TEST
    // await async_set_telegram('environment', {
    //     contract: process.env.CONTRACT_TRC_NILE,
    //     network: process.env.NETWORK_NILE,
    //     explorer: process.env.EXPLORER_NILE,
    //     mnemonic: process.env.MNEMONIC_NILE
    // }); 
    // // 
    // await async_set_telegram('crypto_api', {
    //     blockchain: 'tron',
    //     network: 'nile',
    //     explorer: process.env.EXPLORER_NILE,
    //     crypto_api : process.env.CRYPTO_API
    // }); 
    // 
    // // MAIN
    await async_set_telegram('environment', {
        contract: process.env.CONTRACT_TRC_MAIN,
        network: process.env.NETWORK_MAIN,
        explorer: process.env.EXPLORER_MAIN,
        trongrid_key: process.env.TRONGRID_API,
        mnemonic: process.env.MNEMONIC_MAIN
    }); 
    await async_set_telegram('crypto_api', {
        blockchain: 'tron',
        network: 'mainnet',
        explorer: process.env.EXPLORER_MAIN,
        crypto_api : process.env.CRYPTO_API
    }); 
    // ==========================================================

    //  AUTO BOTS IDENTITY
    // const obj = []
    // for(let i in people ){
    //     obj.push({
    //         id: Math.floor(Math.random() * 7620002132) + 1040852319,
    //         name: people[i]
    //     })
    // }
    // await redis_sd28_auto_set(gameAutoMan, people); // ==> AUTO PHB
    // await async_set_telegram('telegram_auto_bots', obj);
    // 
    // ==========================================================
    // 
    // const a = await async_get_telegram("myGameBots");
    // const b = await async_get_telegram("crypto_api");
    // console.log(a)
}
updateBots();