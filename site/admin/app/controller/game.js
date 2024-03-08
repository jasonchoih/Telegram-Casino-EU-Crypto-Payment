// 
const { get_2,set_2, redis_aws_kill_set } = require('../plugin/redis');
// 
const setting_set = async(d) => 
{
    const { data, name } = d;
    // 
    const _t = 
    {
        GameSet: 'Game settings',
        HdflScfl: 'First Deposit Rebate',
        HdflYgz: 'Monthly Rebate',
        HdflKsfl: 'Loss Rebate',
        HdflTzfl: 'Betting Rebate',
        HdflXxfl: 'Offline Rebate',
        PhbjlSet: 'Leaderboard Rewards',
        settingother: 'Other',
        KillBtc: 'Bitcoin Auto Kill',
        KillKr: 'Korea Auto Kill',
        KillAu: 'Australia Auto Kill',
        WalletSet: 'Wallet Sender Settings',
        HdflDl: 'Special Occasion Bonus'
    }
    if(!name || !_t[name])
    {
        return {M:{c:'Setting failed!'},SettingLoading:''}
    }
    // 
    const _in_set_kill = {
        KillBtc: 'btc',
        KillKr: 'kr',
        KillAu: 'au',
    }
    if(_in_set_kill[name])
    {
        let _is_ok = 1;
        try {
            _is_ok = await redis_aws_kill_set('set_kill_'+_in_set_kill[name], JSON.stringify(data));
        } catch (error) {
            // console.log(error)
        }
        if(!_is_ok) return { M:{c:'Setup failed, please try again!'} };
    }
    await set_2(name, data);
    // 
    return {
        M:{c:_t[name]+'，Saved successfully!'},
        ...await setting_get()
    }
}
const setting_get = async() => 
{
    const _arr = ['GameSet','HdflScfl','HdflYgz','HdflTzfl','HdflKsfl','HdflXxfl','PhbjlSet','settingother','KillBtc','KillKr','KillAu', 'WalletSet', 'HdflDl'];
    let Settings = {};
    for(let i in _arr)
    {
        const _n = _arr[i];
        Settings[_n] = await get_2(_n);
    }
    //
    return {
        Settings,
        SettingLoading:false
    }
}
// 
const oddset = async(d) => 
{
    const { category, type, data } = d;
    const _n = 'odd-'+category+'-'+type;
    // 
    await set_2(_n, data);
    // 
    let _d = {};
    _d[_n] = await get_2(_n);
    // console.log(data, _d);
    return {
        M:{c:'Saved successfully!'},
        _d
    }
}
// 
const oddget = async(d) => 
{
    const { category, type } = d;
    const _n = 'odd-'+category+'-'+type;
    let _d = {};
    _d[_n] = await get_2(_n);
    // console.log(_d);
    return _d;
}
// 
const getbetmax = async(d) => 
{
    const _n = 'sysbetmax';
    return {
        SysMaxbetLoading: false,
        SysMaxbet: await get_2(_n)
    }
}
// 
const setbetmax = async(d) => 
{
    const { data } = d;
    const _n = 'sysbetmax';
    await set_2(_n, data);
    //
    return {
        M:{c:'Saved successfully!'},
        SysMaxbetLoading: false,
        SysMaxbet: data
    }
}
// 
module.exports = {
    //
    setting_set,
    setting_get,
    //
    oddget,
    oddset,
    //
    getbetmax,
    setbetmax
};