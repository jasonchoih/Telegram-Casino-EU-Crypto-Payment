const { USERCARD, USERTELEGRAM, USERS } = require('./app/sequelize/db28');
const { deriveHDWallet } = require('./app/service/bot');
const { getAccountToken } = require('./app/service/crypto');
// 
const { enSign, deSign, xPass, UUID } = require('./app/plugin/cryptos');
const dayjs = require('dayjs')

const test = async() =>
{
    const t = new Date('2024-03-07T05:40:51.043').valueOf()
    console.log(t)
    // for(let i=0; i<999;i++){
    //     const t = new Date('2024-03-07T04:41:07.000').valueOf()
    //     console.log(t)
    //     if(t==1709757667442) {
    //         console.log(i)
    //         return;
    //     }
    // }
    // 2024-03-07 05:40:50 1709761251043    1709761250000
    // 2024-03-07 05:41:31 1709761291535    1709761291000
    // 2024-03-07 05:42:00 1709761320151    1709761320000

    // 
    // const abc = await enSign(2 + '|' + 'IIpzlROKjeG27MCpK4iGOMxi' + '|' + '176.37.149.119' + '|' + t)
    // // // 
    // const tok = '9adbebc35dd962d92921c0558e4802d1939f5ad1d0276a8c65611217b1744ef22d87d2d40f49bceec552c5011fa04e96138026d5ad14a8ce3bd55dca24cbc4a1';
    // console.log({tok,abc})
    // if(abc==tok) {
    //     console.log('lol')
    // }


}

test();