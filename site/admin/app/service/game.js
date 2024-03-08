const { get_1, get_1_List, get_1_List_new_one, get_1_List_last_one } = require('../plugin/redis');
const { DdBjJndJg, PkJg, getNextPeroidsTime, getNowtPeroidsTime, timeShow } = require('./gameTool');
const { xpage } = require('../plugin/tool');
const dayjs = require("dayjs");
const { USERBET } = require('../sequelize/db28');
// 
// 获取单期结果
const getOneLottery = async(game, type, number, peroids) => {
    if (!number) return '';
    let _lottery;
    if (game == 'pk') {
        _lottery = await PkJg(type, number, peroids);
    } else {
        _lottery = await DdBjJndJg(game, type, number);
    }
    return _lottery;
};
// 获取最新开奖数据
const getNewLottery = async(category, type, mode = false) => {
    let lottery;
    let lottery_new;
    let _lottery;
    let _next;
    if (category == 'pk') {
        lottery = await get_1_List_new_one('jnd');
        _lottery = await PkJg(type, lottery.number, lottery.peroids);
        lottery_new = await get_1_List_last_one('jnd');
        _next = await getNowtPeroidsTime('jnd', lottery_new.time, lottery_new.peroids);
    } else {
        let _game = ['dd', 'bj'].find(v => v == category) ? 'ddbj' : category;
        lottery = await await get_1_List_new_one(_game);
        _lottery = await DdBjJndJg(category, type, lottery.number);
        lottery_new = await get_1_List_last_one(_game);
        _next = await getNowtPeroidsTime(_game, lottery_new.time, lottery_new.peroids);
    }
    //
    const _r = [
        [
            parseInt(lottery.peroids),
            _lottery.num,
            _lottery.jg + '',
        ],
        [
            _next.peroids,
            _next.next,
            _next.stop ? 0 : 1 // 1等待开盘 
        ]
    ];
    if (mode) _r[0][3] = _lottery.number;
    // 
    return _r;
};
// 返回最新开奖数据
const returnNewLottery = async(lottery, category, type, mode = false) => 
{
    let lottery_new;
    let _lottery;
    let _next;
    if (category == 'pk') {
        _lottery = await PkJg(type, lottery.number, lottery.peroids);
        lottery_new = await get_1_List_last_one(_game);
        _next = await getNowtPeroidsTime('jnd', lottery_new.time, lottery_new.peroids);
    } else {
        let _game = ['dd', 'bj'].find(v => v == category) ? 'ddbj' : category;
        _lottery = await DdBjJndJg(category, type, lottery.number);
        lottery_new = await get_1_List_last_one(_game);
        _next = await getNowtPeroidsTime(_game, lottery_new.time, lottery_new.peroids);
    }
    //
    const _r = [
        [
            parseInt(lottery.peroids),
            _lottery.num,
            _lottery.jg + '',
        ],
        [
            _next.peroids,
            _next.next,
            _next.stop ? 0 : 1 // 0开盘 1维护
        ]
    ];
    if (mode) _r[0][3] = _lottery.number;
    // 
    return _r;
};
// 号码列表
const getGameList = async(category, type, _page) => 
{
    let _game = ['dd', 'bj'].find(v => v == category) ? 'ddbj' : category;
    if (category == 'pk') _game = 'jnd';
    const { limit, offset } = await xpage(_page);
    const rows = await get_1_List(_game, 0, 19);
    let list = [];
    // 
    for (let i in rows) {
        const li = rows[i];
        let lo = { num: '', jg: '' };
        if (li && li.number) {
            let _number = li.number;
            lo = await getOneLottery(category, type, _number, li.peroids);
        }
        let _r = [
            parseInt(li.peroids),
            await timeShow(category, li.time),
            lo.num,
            lo.jg + '',
            '',
            li.number ? 4 : 2 // 1尚未开奖 2投注中 3开奖中 4已结束
        ];
        if (category == 'pk') {
            _r[4] = [lo.number, lo.des];
        }
        list.push(_r);
    }
    let _four = await getGameNowFour(_game, {
        peroids: parseInt(rows[0].peroids),
        time: rows[0].time,
    });
    return [..._four, ...list];
};
// 最新4期
const getGameNowFour = async(category, lottery) => {
    let _n = [];
    let _peroids = lottery.peroids;
    let _time = lottery.time;
    for (let i = 1; i < 4; i++) {
        _next = await getNextPeroidsTime(category, _time, _peroids);
        _peroids = _next.peroids;
        _time = _next.time;
        _n.unshift([
            _peroids,
            await timeShow(category, _time),
            '',
            '',
            '',
            _next.stop ? 1 : 2
        ]);
        if(_next.stop) return _n;
    }
    return _n;
};
// 投注列表
const getBetList = async(id,category,type,page) => 
{
    const { offset,limit } = await xpage(page);
    //
    const count = await USERBET.count({ where:{ user_id:id,category,type } });
    const rows = await USERBET.findAll({
        attributes: ['peroids','vals','num','dou','win_num','win_dou','time'],
        where: { 
            user_id:id,
            category,
            type 
        },
        order: [['id','DESC']],
        offset,
        limit
    });
    let list = [];
    rows.map((v,k)=>{
        list.push([
            v.peroids,
            dayjs(v.time).format('YY-MM-DD HH:mm:ss'),
            v.num,
            v.dou,
            v.win_dou,
            v.vals
        ])
    })
    let _r = {};
    _r['GameJL'+category+''+type] = [
        [page, count],
        list
    ];
    return _r;
}
// 最新开奖信息
const GameNowData = async(game) => {
    // const { ctx } = this;
    // const lottery = await get('game'+game+'Lottery');
    // let time = await get('game'+game+'TimeDown');
    // time[0] = await getTimeDown(time[0]);
    // 
    let r = {};
    // r['GameLotteryTime'+game] = {
    //     lottery,
    //     time
    // };
    return r;
};
// 游戏是否正确
const isInGame = async(category, type) => 
{
    const categorys = [ 'jnd', 'jnc', 'pk', 'dd', 'bj', 'elg', 'slfk', 'au', 'btc' ];
    const types = [ 10, 11, 16, 22, 28, 36, '28gd', 'sc', 'gyh', 'lh', 'gj' ];
    if(categorys.find((v)=>v==category) && types.find((v)=>v==type)) return true;
    return false;
}
//
module.exports = {
    getNewLottery,
    returnNewLottery,
    isInGame,
    getGameList,
    getBetList,
    GameNowData,
};