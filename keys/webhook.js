const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// 
const controllers = require('./plugin/controllers');
const controller = controllers('../controller');
const SEND = async(path, data) => {
  const _path = path.split('/');
  return await controller[_path[0]][_path[1]](data)
}
const { USERTELEGRAM, USERTRANSACTION } = require('./sequelize/db28');
// 
app.use(bodyParser.json());
// 
/*
Received webhook payload: 
{
  product: 'BLOCKCHAIN_EVENTS',
  event: 'ADDRESS_TOKENS_TRANSACTION_CONFIRMED',
  item: {
    blockchain: 'tron',
    network: 'nile',
    address: 'TAGHjVCiJpY3h8GRW67ni4HDcwPyd1Fxdv',
    minedInBlock: {
      height: 44553430,
      hash: '0000000002a7d4d6de05c736d1d367f8af49816c03b2ca15864d05db9bd8e9df',
      timestamp: 1708522713
    },
    transactionId: '5684432705c71f5c75f835803e3ba287355e7a11fd0643b2eb18dc48140060b7',
    tokenType: 'TRC-20',
    token: {
      amount: '100',
      contractAddress: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
      name: 'Tether USD',
      symbol: 'USDT'
    },
    direction: 'incoming'
  }
}
{
  height: 44498133,
  hash: '0000000002a6fcd518794308eccd8192d60b100b20e58c8cfb06c031199eedca',
  timestamp: 1708350393
}
{
  product: 'BLOCKCHAIN_EVENTS',
  event: 'ADDRESS_TOKENS_TRANSACTION_CONFIRMED',
  item: {
    blockchain: 'tron',
    network: 'mainnet',
    address: 'THZJ5ipvh14GmMtw1p5j2CJatyyXxkZBM6',
    minedInBlock: {
      height: 59460599,
      hash: '00000000038b4bf7d7564ca4fde37f705a097bde81140781cc9b0d523e39b5c2',
      timestamp: 1709017137
    },
    transactionId: 'ed490fc989b0b8979817bd35efe9482f81b14214a7fa7427e633d31a46fac8aa',
    tokenType: 'TRC-20',
    token: {
      amount: '1',
      contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      name: 'Tether USD',
      symbol: 'USDT'
    },
    direction: 'incoming'
  }
}
{
  product: 'BLOCKCHAIN_EVENTS',
  event: 'ADDRESS_TOKENS_TRANSACTION_CONFIRMED',
  item: {
    blockchain: 'tron',
    network: 'nile',
    address: 'TAGHjVCiJpY3h8GRW67ni4HDcwPyd1Fxdv',
    minedInBlock: {
      height: 44812481,
      hash: '0000000002abc8c181093be39113f0d57cc8df40f0d65580af15bb8f5ed59b5b',
      timestamp: 1709330022
    },
    transactionId: '6fbca7a2dc0f02f5c80a838549af376a796404d6c6ce534167460cded6735d78',
    tokenType: 'TRC-20',
    token: {
      amount: '100',
      contractAddress: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
      name: 'Tether USD',
      symbol: 'USDT'
    },
    direction: 'outgoing'
  }
}
*/
// 
app.post('/wbk', async(req, res) => 
{
  // console.log(req['headers'])
  const { host } = req['headers'];
  if(host!='wbk.mgmwss.com'){
    res.status(404).send('Not found');
    return;
  }
  // 
  // console.log(req.body.data)
  const { event, item } = req.body.data;
  const { address, transactionId, direction } = item;
  if(direction=='outgoing'&&event=='ADDRESS_TOKENS_TRANSACTION_CONFIRMED') {
    res.status(200).send('Webhook received successfully.');
    return;
  }
  // 
  const { amount, symbol } = item.token;
  const { height }  = item.minedInBlock;
  // 
  const trx = await USERTRANSACTION.findOne({attributes:['transaction_id'], where:{ 
    address_business: address,
    transaction_id: transactionId
  }});
  // 
  if(trx || amount < 1 ) return;
  // 
  const ut = await USERTELEGRAM.findOne({attributes:['user_id', 'telegram_id'], where:{ address_business: address }});
  if(!ut) return;
  const { user_id, telegram_id } = ut;
  // 
  if(user_id){
    await SEND('agent/go',
    {
      _user_id: user_id, 
      address_business: address,
      money: amount,
      telegram_id,
      transaction_id: transactionId,
      unit: symbol,
      block: height
    });
  } 
  // 
  res.status(200).send('Webhook received successfully.');
});
//
const ports = [
  1001,
  1002,
  1003,
  1004,
  1005,
  // 1006,
  // 1007,
  // 1008,
  // 1009,
  // 1010,
];
//
for(let i in ports)
{
  app.listen(ports[i], () => {
    // console.log('listening on ' + ports[i])
  });
}