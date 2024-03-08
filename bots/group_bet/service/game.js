const { redis_1_lottery_fou_peroids_time } = require('../plugin/redis');
const dayjs = require("dayjs");
// 
const _bet_is_in_peroids = async({category, type, peroids}) => {
    const _lotterys = 
    {
        jnd: 'jnd',
        pk: 'jnd',
        dd: 'ddbj',
        bj: 'ddbj',
        jnc: 'jnc',
        elg: 'elg',
        slfk: 'slfk',
        btc: 'btc',
        au: 'au',
        kr: 'kr'
    };
    const _bet_times = 
    {
        jnd: 30,
        pk: 30,
        dd: 30,
        bj: 30,
        jnc: 30,
        elg: 25,
        slfk: 30,
        btc: 5,
        au: 20,
        kr: 10
    };
    // 
    let _is_qun = ['q214','q28'].find(v=>v==category);
    // 
    const _category = _is_qun ? type : category;
    const _game = _lotterys[_category];
    // 
    let _fou = await redis_1_lottery_fou_peroids_time(_game);
    //
    if(!_fou) return '投注失败，请稍后再试！';
    //
    let _is_in = _fou.find(v=>v[0]==peroids);
    if(!_is_in) return '该期数不在投注范围！';
    //
    const _xt = parseInt(dayjs(_is_in[1]).diff(dayjs(), 'second'));
    const _xtc = _bet_times[_category];
    if(_xt<_xtc) return '投注时间已过！';
    //
    return '';
}

//
module.exports = {
    _bet_is_in_peroids
};