const { async_get_telegram } = require('../plugin/redis');
const TronWeb = require('tronweb');
// 
const deriveHDWallet = async(path) =>
{
    if (!path) return;
    // 
    const { mnemonic } = await async_get_telegram("environment");
    const _path = "m/44'/195'/0'/0/" + path;
    const node = TronWeb.fromMnemonic(mnemonic, _path);
    return node.privateKey;
}
module.exports={
    deriveHDWallet
}