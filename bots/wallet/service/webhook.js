const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, '../.env') });
const { async_get_telegram } = require('../plugin/redis');
const https = require("https");
// 
const createEventSubTokenConfirmed = async(d) =>
{
    if(!d) return;
    const { walletAddress, callbackURL } = d;
    // 
    const { crypto_api, blockchain, network } = await async_get_telegram("crypto_api");
    // 
    return new Promise((resolve, reject) => 
    {
        const options = {
            "method": "POST",
            "hostname": "rest.cryptoapis.io",
            "path": `/v2/blockchain-events/${blockchain}/${network}/subscriptions/address-tokens-transactions-confirmed`,
            "qs": {"context":""},
            "headers": {
                "Content-Type": "application/json",
                "X-API-Key": crypto_api
            }
        };
        // 
        const req = https.request(options, (res) => 
        {
            const chunks = [];
            // 
            res.on("data", (chunk) => 
            {
                chunks.push(chunk);
            });
            // 
            res.on("end", async() =>
            {
                const body = Buffer.concat(chunks);
                resolve(JSON.parse(body.toString()));
            });
            // 
            req.on('error', (error) => {
                reject(error);
            });
        });
        // 
        req.write(JSON.stringify({
            "context": "",
            "data": {
                "item": {
                    "address": walletAddress,
                    "allowDuplicates": false,
                    "callbackSecretKey": "",
                    "callbackUrl": callbackURL,
                    "receiveCallbackOn": 2
                }
            }
        }));
        //   
        req.end();
    })
    /*
        {
            apiVersion: '2023-04-25',
            requestId: '65d5d3089a1d2054b44f23d7',
            context: '',
            error: {
                code: 'already_exists',
                message: 'The specified resource already exists.'
            }
        }
        // 
        {
            apiVersion: '2023-04-25',
            requestId: '65d5d2f39a1d2054b44f230d',
            context: '',
            data: {
                item: {
                    address: 'TAGHjVCiJpY3h8GRW67ni4HDcwPyd1Fxdv',
                    callbackUrl: 'https://ht.mgmwss.com/webhook',
                    createdTimestamp: 1708511987,
                    eventType: 'ADDRESS_COINS_TRANSACTION_CONFIRMED',
                    isActive: true,
                    receiveCallbackOn: 2,
                    referenceId: '7b9077aa-2e26-4edd-bc88-df84b24dbfcb'
                }
            }
        }
    */
}
// 
const deleteEventSub = async(d) =>
{
    if(!d) return;
    const { id } = d;
    // 
    const { crypto_api, blockchain, network } = await async_get_telegram("crypto_api");
    // 
    const options = {
        "method": "DELETE",
        "hostname": "rest.cryptoapis.io",
        "path": `/v2/blockchain-events/${blockchain}/${network}/subscriptions/${id}`,
        "qs": {"context":""},
        "headers": {
          "Content-Type": "application/json",
          "X-API-Key": crypto_api
        }
    };
    // 
    return new Promise((resolve, reject) => 
    {
    const req = https.request(options, (res) => 
    {
        const chunks = [];
      
        res.on("data", (chunk) => 
        {
          chunks.push(chunk);
        });
      
        res.on("end", async() => 
        {
          const body = Buffer.concat(chunks);
          resolve(JSON.parse(body.toString()));
        });
      });
      req.write(JSON.stringify([]));
    })
    /*
        {
            apiVersion: '2023-04-25',
            requestId: '65d5d3d993020bc98792593b',
            error: {
                code: 'resource_not_found',
                message: 'The specified resource has not been found.'
            }
        }
        // 
        {
            apiVersion: '2023-04-25',
            requestId: '65d5d40393020bc987925c73',
            data: {
                item: {
                    callbackUrl: 'https://ht.mgmwss.com/webhook',
                    createdTimestamp: 1708511987,
                    eventType: 'ADDRESS_COINS_TRANSACTION_CONFIRMED',
                    referenceId: '7b9077aa-2e26-4edd-bc88-df84b24dbfcb'
                }
            }
        }
    
    */
}
// 
// const test = async() =>
// {
//     const a = await deleteEventSub({
//         id: 'c10fff47-e306-40a9-a9fe-9f115333c967'
//     })
//     // const a = await createEventSubTokenConfirmed({
//     //     walletAddress: 'TAGHjVCiJpY3h8GRW67ni4HDcwPyd1Fxdv', 
//     //     callbackURL: 'https://wbk.mgmwss.com/wbk'
//     // })
//     console.log(a);
//     // console.log()
// }
// test()
// 
module.exports={
    createEventSubTokenConfirmed
}