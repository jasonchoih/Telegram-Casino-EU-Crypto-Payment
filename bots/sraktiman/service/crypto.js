const https = require("https");
const { async_get_telegram } = require('../plugin/redis');
// 
const getAccountToken = async(address) =>
{
    if(!address) return;
    // 
    const { blockchain, network, crypto_api } = await async_get_telegram("crypto_api");
    const options = {
      "method": "GET",
      "hostname": "rest.cryptoapis.io",
      "path": `/v2/blockchain-data/${blockchain}/${network}/addresses/${address}/tokens`,
      "qs": {
        "context":"yourExampleString","limit":50,"offset":0
        },
      "headers": {
        "Content-Type": "application/json",
        "X-API-Key": `${crypto_api}`
      }
    };
    // 
    return new Promise((resolve, reject) => 
    {
        const req = https.request(options, (res) => 
        {
            const chunks = [];
            res.on('data', (d) => {
                chunks.push(d);
            })
            res.on("end", () =>
            {
              const body = Buffer.concat(chunks);
              resolve(JSON.parse(body));
            });
        });
        // 
        req.on('error', (e) => {
            reject(e);
        });
        req.end();
    })
}
// 
module.exports={
    getAccountToken
}