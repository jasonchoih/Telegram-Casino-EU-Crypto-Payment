const { KMID } = require('../tool/cryptos');

const test = async() =>
{
    const _km = await KMID();
    // console.log(_km);
    // console.log(_km.length);
};
test();