//
const dayjs = require('dayjs'); 
const { 
    USERS,USERDATA,USERLOG,USERDAYDATA,USERSUM,AGENTCHARGE,
    OPENLOG,
    USERBET
} = require('../sequelize/db28');
const { SubDo, get_1_List_fou_new, set_us_async, get_1_List, get_1_List_last_one, get_1_List_last_peroids, get_us_async, pub_us_asysc } = require('../plugin/redis');
const { getNextPeroidsTime, allJg } = require('../service/gameTool');
const { get_game_lottery_list_check } = require('../service/lottery');
const request = require('request-promise');
// 
const user = async(d) => 
{
    const { id, _user_id } = d;
    // 
    const _user = await USERS.findOne({where:{id:_user_id}});
    if(!_user) return { BLM:'查无此人！', BLL:'' };
    if(_user.role==2) return { BLM:'该 ID 为代理账号！', BLL:'' };
    const _user_data = await USERDATA.findOne({where:{user_id:_user_id}});
    if(!_user_data) return { BLM:'查无此人数据！', BLL:'' };
    const _user_log = await USERLOG.findOne({attributes:['time'],where:{user_id:_user_id},order:[['id','DESC']]});
    // 
    const _user_sum = await USERSUM.findOne({where:{user_id:_user_id}})||{};
    // 
    const _agent_charge = await AGENTCHARGE.findAll({attributes:['money','agent_nick','time','status'],where:{user_id:_user_id},limit:8,order:[['id','DESC']]});
    const _time_today = dayjs().format('YYYY-MM-DD');
    const _time_yestoday = dayjs().subtract(1,'day').format('YYYY-MM-DD');
    const _user_today = await USERDAYDATA.findOne({where:{user_id:_user_id,time:_time_today}})||{};
    const _user_yestoday = await USERDAYDATA.findOne({where:{user_id:_user_id,time:_time_yestoday}})||{};
    // 
    const _user_charge_list = [];
    for(let i=0;i<8;i++)
    {
        const _a_c_i = _agent_charge[i];
        if(_a_c_i)
        {
            _user_charge_list.push([
                dayjs(_a_c_i.time).format('MM-DD'),
                _a_c_i.money,
                _a_c_i.agent_nick,
                _a_c_i.status
            ]);
        }else{
            _user_charge_list.push(['-','-','-']);
        }
    }
    let MdataUser = [
        [
            ['Name', _user.nick],
            ['Account', _user.user],
            ['Phone', (_user.calling || '-') +' '+ (_user.phone|| '-')],
            ['Full Name', _user.name||'-'],
            ['VIP', _user.level],
            ['QQ', _user.qq||'-'],
            ['WeChat', _user.wx||'-'],
            ['Parent', _user.parent],
        ],
        [
            ['Balance', _user_data.dou ||0],
            ['Bank', _user_data.bank],
            ['Exp', _user_data.exp],
            ['Sound', _user.sound],
            ['Test', _user.cs],
            ['Control', _user.km],
            ['Status', _user.status],
            ['Login', _user_log&&_user_log.time ? dayjs(_user_log.time).format('YYYY-MM-DD HH:mm:ss') : '']
        ],
        [
            ['Charge Quantity', _user_sum.charge_num||0, _user_today.charge_num||0, _user_yestoday.charge_num||0],
            ['Charge Amount', _user_sum.charge||0, _user_today.charge||0, _user_yestoday.charge||0],
            ['Exchange Quantity', _user_sum.exchange_num||0, _user_today.exchange_num||0, _user_yestoday.exchange_num||0],
            ['Exchange Amount', _user_sum.exchange||0, _user_today.exchange||0, _user_yestoday.exchange||0],
            ['Exchange Fee', _user_sum.exchange_rate||0, _user_today.exchange_rate||0, _user_yestoday.exchange_rate||0],
            ['Bet', _user_sum.bet||0, _user_today.bet||0, _user_yestoday.bet||0],
            ['LS', _user_sum.ls||0, _user_today.ls||0, _user_yestoday.ls||0],
            ['Profit', _user_sum.win||0, _user_today.win||0, _user_yestoday.win||0],
        ],
        _user_charge_list
    ];
    //
    return { 
        MdataUser, 
        MdataUserd:{
            id: _user_id,
            nick: _user.nick,
            dou: _user_data.dou,
            bank: _user_data.bank
        },
        BLM:'', 
        BLL:'' 
    }
}
// 
const user_kc = async(d) => 
{
    let { uuidkey, id, _user_id, dou, mode, ip } = d;
    // 
    dou = parseInt(dou);
    if(!dou || dou<=0)
    {
        return { KcStatus:{money:{ s: 'error', h: '金豆不能为 0' } }};
    } 
    if(!mode || !['dou','bank'].find(v=>v==mode))
    {
        return { KcStatus:{money:{ s: 'error', h: '模式错误，请重试！' } }};
    }
    // 
    await SubDo({ 
        path:[ 'admin_user_kc', mode ],
        data:{ uuidkey, id, _user_id, dou, ip }
    });
}
//
const lottery = async(d) => 
{
    const { _user_id, peroids, game } = d;
    const [ category, type ] = game.split('/');
    // 
    const _user_bet = await USERBET.findOne({attributes:['num','dou','win_dou','wins','vals'],where:{user_id:_user_id,category,type,peroids}});
    if(!_user_bet)
    {
        return { BLM:'没有找到详细记录，请稍后再试！', BLL:'' };
    }
    const _wins = _user_bet.wins&&JSON.parse(_user_bet.wins)||{};
    const _vals = JSON.parse(_user_bet.vals);
    // 
    const vals = {};
    for(let i in _vals)
    {
        let _vi = _vals[i];
        if(_wins[i])
        {
            vals[i] = [
                _vi,
                ..._wins[i]
            ];
        }else{
            vals[i] = [
                _vi,
                '',
                ''
            ];
        }
    }
    // 
    return { 
        MdataLottery:{
            num: _user_bet.num,
            dou: _user_bet.dou,
            win_dou: _user_bet.win_dou,
            vals
        }, 
        BLM:'', 
        BLL:'' 
    }
}
// 
const list_sum = async(a, b) => 
{
    let _n = b;
    if(a && Object.keys(a).length>0)
    {
        for(let i in a)
        {
            if(_n[i])
            {
                _n[i]+=a[i];
            }else{
                _n[i]=a[i];
            }
        }
    }
    return _n;
}
//
const getkr = async(d) => 
{
    const lottery_new = await get_1_List_fou_new('kr');
    // 
    if(!lottery_new) return { BLL:'' }
    // 
    const _lottery = await USERBET.findAll({
        attributes: ['category','type','vals'],
        where:{
            peroids: lottery_new.peroids,
            category: ['kr', 'q28', 'q214'],
            type: [ '11', '16', '28', '28gd', '36', 'kr' ]
        }
    });
    let KrBets = {};
    for(let i in _lottery)
    {
        const _lotteryi = _lottery[i];
        const _ct = (_lotteryi.category+''+_lotteryi.type).replace(/gd/, "");
        KrBets[_ct] = await list_sum(KrBets[_ct], JSON.parse(_lotteryi.vals));
    }
    // 
    return {
        KrBets,
        KrData:{
            peroids: lottery_new.peroids,
            time: await dayjs(lottery_new.time).diff(dayjs(), 'second')
        },
        BLL:''
    }
}
const setkr = async(d) => 
{
    const { id,admin_nick, time, number } = d;
    //
    if(id!=1)
    {
        return {
            M:{c:'You have no permissions for this action!'}
        }
    }
    //
    const lottery_new = await get_1_List_fou_new('kr');
    let des = JSON.stringify(await allJg(number));
    // 
    await set_us_async('gamekrShaZhuNumber', JSON.stringify(number));
    await OPENLOG.create({
        admin_id: id,
        admin_nick,
        type:'kr',
        peroids: lottery_new.peroids,
        des,
        time
    });
    return {
        Krset: 2
    }
}
//
const getbtc = async(d) => 
{
    const lottery_new = await get_1_List_fou_new('btc');
    // 
    if(!lottery_new) return { BLL:'' }
    // 
    const _lottery = await USERBET.findAll({
        attributes: ['category','type','vals'],
        where:{
            peroids: lottery_new.peroids,
            category: ['btc', 'q28', 'q214'],
            type: [ '11', '16', '28', '28gd', '36', 'btc' ]
        }
    });
    let BtcBets = {};
    for(let i in _lottery)
    {
        const _lotteryi = _lottery[i];
        const _ct = (_lotteryi.category+''+_lotteryi.type).replace(/gd/, "");
        BtcBets[_ct] = await list_sum(BtcBets[_ct], JSON.parse(_lotteryi.vals));
    }
    // 
    return {
        BtcBets,
        BtcData:{
            peroids: lottery_new.peroids,
            time: await dayjs(lottery_new.time).diff(dayjs(), 'second')
        },
        BLL:''
    }
}
const setbtc = async(d) => 
{
    const { id,admin_nick, type, number, time } = d;
    //
    if(id!=1)
    {
        return {
            M:{c:'You have no permissions for this action!'}
        }
    }
    //
    const lottery_new = await get_1_List_fou_new('btc');
    let des = JSON.stringify({
        type,
        number
    });
    //
    await set_us_async('lottery_btc_open_now', JSON.stringify({type,number}));
    await OPENLOG.create({
        admin_id: id,
        admin_nick,
        type:'btc',
        peroids: lottery_new.peroids,
        des,
        time
    });
    // 
    return {
        Btcset: 2
    }
}
// 补奖 - 获取 get
const get_game_no_lottery_list = async(d) =>
{
    const categorys = [ 'jnd', 'ddbj', 'jnc', 'elg', 'slfk', 'au', 'kr', 'btc'  ];
    const _list = [];
    for(let i in categorys)
    {
        const _category_i = categorys[i];
        const _game_list = await get_1_List(_category_i, 0, -1);
        const _last_peroids = _game_list[_game_list.length-1].peroids;
        //
        for(let j=_last_peroids;j<(_last_peroids+(_game_list.length-1));j++)
        {
            const _this = _game_list.find(v=>v.peroids==j);
            if(!_this || !_this.number) _list.push([_category_i,j]);
        }
    }
    // 
    const _r = {};
    _r['GameNoLotteryList'] = [[0,_list.length],_list];
    _r['GameNoLotteryLoading'] = false;
    return _r
}
// 
const set_game_no_lottery = async(d) => 
{
    let { id, admin_nick, time, category, type, num, number, _time, peroids } = d;
    // 
    peroids = parseInt(peroids);
    const categorys = ['jnd','jnc','ddbj','elg','slfk','au','kr','btc'];
    //
    if(!categorys.find(v=>v==category)) return { MdopenPost:'', MdopenTip:'暂不支持该游戏' }
    if(!/^\d{5,20}$/.test(peroids)) return { MdopenPost:'', MdopenTip:'期数错误' }
    if(!/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2})\:(\d{2})\:(\d{2})$/.test(_time)) return { MdopenPost:'', MdopenTip:'时间格式错误' }
    if(!number) return { MdopenPost:'', MdopenTip:'请输入开奖号码' }
    number = number.split(',');
    for(let i in number)
    {
        number[i] = parseInt(number[i]);
    }
    // 
    let _data = {
        old: 1,
        category,
        peroids,
        time: _time,
        number
    }
    //
    const _first_peroids = await get_1_List_last_one(category);
    if(_first_peroids && parseInt(_first_peroids.peroids) < peroids)
    {
        return {
            MdopenPost:'',
            MdopenTip:'不正确的期数，比第一期大，请检查'
        }
    }
    const _last_peroids = await get_1_List_last_peroids(category);
    if(_last_peroids && parseInt(_last_peroids.peroids) > peroids)
    {
        return {
            MdopenPost:'',
            MdopenTip:'不正确的期数，比最后一期小，请检查'
        }
    }
    //
    if(id!=3&&['btc','kr'].find(v=>v==category))
    {
        const _game_list = await get_1_List(category, 0, -1);
        const _this_peroids = _game_list.find(v=>v.peroids==peroids);
        if(_this_peroids && _this_peroids.number)
        {
            return {
                MdopenPost:'',
                MdopenTip:'该游戏不支持已开奖更改，请检查'
            }
        }
    }
    // 
    if(category=='btc')
    {
        let _btc_lotterys = '';
        try {
            _btc_lotterys = JSON.parse(await get_us_async('lottery_btc_cache'));
        } catch (error) {
            
        }
        if(!_btc_lotterys) return { MdopenPost:'', MdopenTip:'设置失败，请重试' }
        _data.number = _btc_lotterys[type][num][1];
        _data.code = _btc_lotterys[type][num][0];
    }
    // 
    const _is_ok = await pub_us_asysc('lottery_open_data', JSON.stringify(_data));
    if(_is_ok)
    {
        let des = JSON.stringify(await allJg(_data.number));
        if(category=='btc')
        {
            des = JSON.stringify({
                type,
                number: num
            })
        }
        await OPENLOG.create({
            admin_id: id,
            admin_nick,
            type: category,
            peroids: peroids,
            des,
            time
        });
        return {
            MdopenReload: 1,
            MdopenPost:'',
            MdopenTip:'补奖完成'
        } 
    }
    // 
    return {
        MdopenPost:'',
        MdopenTip:'补奖失败，请重试'
    }
}
// 
const caomei_get = async(d) => 
{
    const { category, peroids } = d;
    const categorys = ['jnd','ddbj','jnc','elg','slfk'];
    // 
    if(!categorys.find(v=>v==category))
    {
        return { MdopenGetLoading:'',M:{c:'不支持该游戏的自动获取'} }
    }
    const uri = 'http://170.106.15.145:3692/?game='+category+'&peroids='+peroids;
    try {
        const _data = await request({
            method: 'get',
            json: true,
            uri,
            // timeout: 5000
        });
        if (_data&&_data.time&&_data.number) return { MdopenGetLoading:'', MdopenGetData:_data };
    } catch (error) {

    }
    return { MdopenGetLoading:'',M:{c:'没有获取到任何数据'} }
}
// 
module.exports = {
    user,
    user_kc,
    lottery,
    // 
    getkr,
    setkr,
    // 
    getbtc,
    setbtc,
    //
    get_game_no_lottery_list,
    set_game_no_lottery,
    // 
    caomei_get
};