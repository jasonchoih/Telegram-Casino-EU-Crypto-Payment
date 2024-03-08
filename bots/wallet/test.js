const TronWeb = require('tronweb');
const { async_get_telegram } = require('./plugin/redis');
// 
const deriveHDWallet = async(path) =>
{
  if (!path) return;
  const { mnemonic } = await async_get_telegram("environment");
  const _path = "m/44'/195'/0'/0/" + path;
  const node = TronWeb.fromMnemonic(mnemonic, _path);
  const { address, privateKey, publicKey } = node;
  console.log({
    address, privateKey, publicKey
  });
  return node
}
// 
const test = async() =>
{
//    const a =  await deriveHDWallet(0)
//    console.log(a)
    
    await deriveHDWallet(1)
    await deriveHDWallet(2)
    await deriveHDWallet(3)
    await deriveHDWallet(4)
    await deriveHDWallet(5)
    await deriveHDWallet(6)
    await deriveHDWallet(7)
}
// test()

// 
// const test = async() =>
// {
//     const { network, trongrid_key, contract } = await async_get_telegram("environment");
//     // 
//     console.log({
//         network,
//         trongrid_key,
//         contract
//     })
//     // 
//     const tronWeb = new TronWeb({ 
//         fullHost: network, 
//         privateKey: 'f7812183ec2e71e46f46aa0af4678c5d081f640d5f512c2e9c06a0134e3692b0',
//         "TRON-PRO-API-KEY" : trongrid_key
//     });
//     // 
//     const { abi } = await tronWeb.trx.getContract(contract);
//     const contract_abi = tronWeb.contract(abi.entrys, contract);
//     const balance = await contract_abi.methods.balanceOf("THZJ5ipvh14GmMtw1p5j2CJatyyXxkZBM6").call();
//     console.log((balance.toString())/1_000_000);
    
//     try {
//         const hash = await contract_abi.methods.transfer('TPkyge3AVdtZEo1A2nx5VK3MFdK7BR7XfZ', 1_000_000).send();
//         console.log(hash)
//     } catch (error) {
//         console.log(error)
//     }
//     // const a = await tronWeb.isAddress("TPkyge3AVdtZEo1A2nx5VK3MFdK7BR7XfZ")
//     // console.log(a)
// }
// test()
/*
    {
    address: 'THZJ5ipvh14GmMtw1p5j2CJatyyXxkZBM6',
    privateKey: '0xf7812183ec2e71e46f46aa0af4678c5d081f640d5f512c2e9c06a0134e3692b0',
    publicKey: '0x04354706c04248c24101e7d17dcb2c2e957a6cac3023ac9153b2afb37edcfdd70b84e644db32e837b2a116a91507edc6924bad0c3b4666ad97b53cb495850626e0'
    }
    {
    address: 'TAzk3R2AoWHJkdRWM6rpKEV7CyVFDAKmTp',
    privateKey: '0x264eec0805974fe4299719098c4c324dc52a90bbc954b7660b7bcbdf7045bb5b',
    publicKey: '0x04dffaf190e6dce3d65e21a3be8cc350483e7372cfcac667b134025c522aafd9b31fbc6ebc4499eedefdd200cfe0e870aea6b392dc0432b943a139ba17c56a9832'
    }
    {
    address: 'TMdUA7rhhkbDcTuJ5hyKPiDB5i1MacJCGH',
    privateKey: '0x7be0e78eee978cfd06088f31814d02cd4defd275c68fc94fd2a27e843cc8bc16',
    publicKey: '0x0458dd68b7bfea9f43b161ab224bdae1d0bf2ddba2daf632cea0de18ad86971555a128c786a6ac53ea8ebcabb5f3b73d7d1c7311d1df4fc6e218cbe38cb9fbd476'
    }
    {
    address: 'TFZKCcczWgmnzgKnw16jGSVCiNkQiEWq5x',
    privateKey: '0xdd081f02fcf8bb9ca57d4a3efa3862c518a8a3c4ec13c12ca19fd1913eb81be7',
    publicKey: '0x04cd925ce07ad5aee88474270b1b2f40f1cfe14be1deade86e1d275baf37cd3fbd19c36df67c638a87448acd41d0ec02d3fd5ac46b912c090fb1a5b0c27974f308'
    }
*/


/*
{
  address: 'TAGHjVCiJpY3h8GRW67ni4HDcwPyd1Fxdv',
  privateKey: '0x83a6e475448b9371bdc215344cab7aaf89972abc1b7a8f951caa787e5177dd58',
  publicKey: '0x041dac5afb6ae3aed14cf2c9215ab42fcedbf046fd346a3d1ea50071798a15360b29366de1947b87706418c839d6d942d3d35562ddf6fd97fd626e4f03ed711d2f'
}
{
  address: 'TJMKu6PvVZSjCcAhZaLKT1pj4vkG2hHfjc',
  privateKey: '0x910ef78755aeb404ffb93ae8209ec4f84c72c503cc96bdb9af1e478aa26fd4da',
  publicKey: '0x04032ae47647fceac350c4e1f174c66c6439360f9b2d7af8ffef31995581b53139cf6ee8aa5e8b4436de0d697f7f4c84237bce7e197ff30d053a9308e50ce54505'
}
{
  address: 'TGLiVKcjA7MtvSCFyEPD5zF9bPVZyBLbYQ',
  privateKey: '0xe9753ca2d3538c525007b55ebba0ba8ebefc262d62e7367482247df636ccd6b6',
  publicKey: '0x04331fa32d24dc0709a7d4a23ba047422f9e36eebfe9ddec577288591513783a477d7485555039eb45d2d07422bc4acd99a9e8c92a2a2d42eeb3f8be0df9f1a463'
}
{
  address: 'TFK6j4dAkCjskAotzxEM8aikrwwgVZUrdx',
  privateKey: '0x39cdd0f37439bd13ff9288a59f1d4bb36fb65f346976411620f4d923249c42ea',
  publicKey: '0x04bd09fee5500ef6e383b1846a6ef2c74ca3f79475474d38598fb3eb955b0e07fdcf1fa28b3e54e9eb2ab1fd20c169dd85bcd27ec1e5f8f9ff2691a98f1120ae5b'
}
{
  address: 'TV5xkNpSfYSaELvqJ6t2FMwgmMQGoGdQnx',
  privateKey: '0x2585b140986d4188f240fe8575ed44685a2ed1b02cd0f2f105f1d044c0fddd3d',
  publicKey: '0x048f0b2ca1b4d8ca2f4b3e0d8472e58dc6ee4549039d7db6094569c5e011e104a82bb20d3f9769c8c8facf0b7b2f6731b92302cb239e057cb85d4d708e731bd0fd'
}
{
  address: 'TVLv5KK93NaiVsiTRepYGZK6v6Narvh5XK',
  privateKey: '0x5467b900c595eb635d72b41f117ff88416461153e2f9bdbb5f433e8a19394dba',
  publicKey: '0x041237bf2a6b70776d2f30155b1682cd65dd05ce4632b3979aa9381956ce2ce92b98abf3eb9ed5629c5e497be4f8627b78a91a26553739e9a63ecd453d0e2171df'
}
{
  address: 'TWD8vS1sWKyzFurRfYjQL7A8dyZJ2nd6Wa',
  privateKey: '0x79a162909e4d984134b96413afb39a77db1179b5ac136984f73648b94edc618c',
  publicKey: '0x040689592e78ee00707959a56ae7c373d3d2eac3b8c206c2e035d600e4646d7d5afb608034c721077bf404a92148859bf78cebbf3e6f3800e9350f39b563c96fca'
}

*/