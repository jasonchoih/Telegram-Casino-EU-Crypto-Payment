// 
const { 
    //
    redis_sd28_pub,
    redis_sd28_lpush,
    //
    redis_lottery_set,
    redis_lottery_llen,
    redis_lottery_list,
    redis_lottery_lindex,
    redis_lottery_lset,
    redis_lottery_lpush,
    redis_lottery_ltrim,
    redis_lottery_linsert,
    redis_lottery_setex,
    redis_lottery_lrange,
    redis_lottery_rpop,
    // 
    client_us
    //
} = require('./redis');
// 
const dayjs = require("dayjs");
const { getNextPeroidsTime } = require('./gameTime');
const { getGameType, gameBetDatas, gamePwin } = require('./gameTool');
const { ycIn } = require('./gameYc');
//
const lottery_list_fix = 'lottery_list_';
const lottery_last_fix = 'lottery_last_';
const lottery_fou_fix = 'lottery_fou_';
// 四期投注情况
const fouIn = async(d) => 
{
    const { category, peroids, time } = d;
    //
    // console.log('-----------------',category, peroids, time);
    const _n = lottery_fou_fix+''+category;
    const _old = await redis_lottery_list(_n, 0, -1);
    let _time = time;
    let _send = [];
    //
    // if(_next.stop) return;
    //
    for(let i=1;i<5;i++)
    {
        const _peroids = parseInt(peroids)+i;
        const _next = await getNextPeroidsTime(category, _time);
        // 
        const _f = _old.find(v=>v.peroids==_peroids)
        if(!_f)
        {
            _send.unshift({
                peroids: _peroids,
                time: _next.time,
            });
            await redis_lottery_lpush(_n, JSON.stringify({
                peroids: _peroids,
                time: _next.time,
                p: await gameBetDatas(category)
            }));
        }else{
            const _i = _old.findIndex(v=>v.peroids==_peroids);
            if(_i!==-1)
            {
                await redis_lottery_lset(_n, _i, JSON.stringify({
                    peroids: _peroids,
                    time: _next.time,
                    p: _f.p
                }));
            }
        }
        //
        _time = _next.time;
    }
    //
    await redis_lottery_ltrim(_n,0,4);
    // 
    if(_send&&_send.length>=1)
    {
        await sendNew(category, _send[0]);
    }
    // 
    await sendQunNew(d);
    // const _li = await redis_lottery_lrange(_n,0,-1);
    // console.log(category,_li);
}
// 获得四期投注情况
const fouFind = async(category,peroids) => 
{
    const _n = lottery_fou_fix+''+category;
    const _old = await redis_lottery_list(_n, 0, -1);
    const _this = _old.find(v=>v.peroids==peroids);
    //
    // console.log(category,'abc---', _old, _this);
    if(!_this || !_this.p) return '';
    return _this.p;
}
// 
const lotteryIn = async(d) => 
{
    const { category, peroids, time } = d;
    const _l = lottery_list_fix+''+category;
    //
    let _list_first = await redis_lottery_lindex(_l, 0);
    // console.log('每天进入------', category, d, _list_first);
    // console.log('每日数据------',d);
    if(_list_first)
    {
        _list_first = JSON.parse(_list_first);
        if(parseInt(_list_first.peroids) < parseInt(peroids))
        {
            let _d = {
                peroids,
                time
            };
            // console.log('aaaaaaaaaaaa',_d);
            const p = await fouFind(category,peroids);
            // console.log(category,'页面投注情况--',p);
            if(p)
            {
                _d['p'] = p;
            }
            // console.log(category,'最新情况--',_d);
            await dataIn(_l, JSON.stringify(_d));
        }
    }
    //
    // 查看最新数据
    // let _list = await redis_lottery_list(_l, 0, -1);
    // console.log(_list);
    //
}
// 
const lotteryUpdate = async(d) => 
{
    // console.log('进入到---------- 更新 ----------');
    // 
    const { category, peroids, time, number, code, old } = d;
    const _l = lottery_list_fix+''+category;
    // 
    const p = await fouFind(category,peroids);
    const result = await getGameType(category, { peroids, time, number });
    let _d = {
        peroids, 
        time, 
        number,
        ...result,
        p: await gamePwin(p)
    };
    // console.log('--------------------', JSON.stringify(_d));
    if(code) _d['code'] = code;
    //
    let _list_first = await redis_lottery_lindex(_l, 0);
    // 情况 1 - 存在第一条单中，但为空
    if(!_list_first || _list_first==null)
    {
        const _is_in = await dataIn(_l, JSON.stringify(_d));
        // 开奖通知
        if(_is_in) await dataOpen(category, _d, old);
        return;
    }
    // 情况 2 - 存在第一期
    if(_list_first)
    {
        _list_first = JSON.parse(_list_first);
        if(parseInt(_list_first.peroids) < parseInt(peroids))
        {
            const _is_in = await dataIn(_l, JSON.stringify(_d));
            // 开奖通知
            if(_is_in) await dataOpen(category, _d, old);
            return;
        }
    }
    // 情况 3 - 存在于列表中
    let _list = await redis_lottery_list(_l, 0, -1);
    if(_list)
    {
        let _index = _list.findIndex(v=>v.peroids==peroids);
        if(_index>-1)
        {
            const _is_set = await redis_lottery_lset(_l, _index, JSON.stringify(_d));
            if(_is_set) await dataOpen(category, _d, old);
            return;
        }
    }
    // 情况4 不存在列表中
    const _old_index_find = _list.find(v=>peroids > v.peroids);
    if(_old_index_find)
    {
        const _is_in_four = await redis_lottery_linsert(_l, 'BEFORE', JSON.stringify(_old_index_find), JSON.stringify(_d));
        if(_is_in_four>-1) await dataOpen(category, _d, old);
        return;
    }
}
// 
const gameIn = async(d) => 
{
    if(!d || Object.keys(d).length<=0) return;
    // console.log('游戏进入----',d);
    // 补奖
    if(d.number&&d.old&&d.old==1)
    {
        await lotteryUpdate(d);
        return;
    }
    // 新开奖
    if(d.number)
    {
        await lotteryUpdate(d);
        await fouIn(d);
        return;
    }
    await lotteryIn(d);
    await fouIn(d);
}
// 新的通知
const dataIn = async(n, d) => 
{
    // if(d&&d.category=='au') console.log('---------------------验证数据---------------------', d);
    if(!d) return false;
    // 插入数据
    await redis_lottery_lpush(n, d);
    // 只保留500条
    await redis_lottery_ltrim(n, 0, 499);
    return true;
}
// 开奖通知
const dataOpen = async(category, d, old) => 
{
    // 发送
    await sendOpen(category, d, old);
    // 如果是补奖则不继续执行
    if(old) return;
    // 最新一期记录
    await redis_lottery_set(lottery_last_fix+''+category, d);
    // 生成预测
    await ycIn(category, d);
}
// 发送新一期
const sendNew = async(category, d) => 
{
    const _data = {
        controller: 'game_lottery_new',
        category,
        ...d
    };
    // console.log(_data);
    // sd28
    await redis_sd28_pub('sd28-site-room', JSON.stringify(_data));
}
// 
const sendQunNew = async(d) => 
{
    let { category, peroids, time } = d;
    // 
    // if(['kr','btc','jnd','elg','au'].find(v=>v==category))
    // {
        peroids = peroids+1;
    // }
    // 
    const categoryx = {
        jnd: [['jnd','pk'], 30],
        jnc: [['jnc'], 30],
        ddbj: [['dd','bj'], 30],
        elg: [['elg'], 25],
        slfk: [['slfk'], 30],
        au: [['au'], 20],
        btc: [['btc'], 5],
        kr: [['kr'], 10],
    };
    const _category_name = 
    {
        bj: '台湾',
        dd: '台湾蛋蛋',
        pk: 'PK',
        jnd: '加拿大',
        jnc: '加拿大西部',
        btc: '比特币',
        kr: '韩国',
        au: '澳洲',
        elg: '俄勒冈',
        slfk: '斯洛伐克'
    }
    if(!categoryx[category]) return;
    let _categorys = categoryx[category][0];
    let _category_time = categoryx[category][1];
    const qunc = ['q214','q28'];
    // 
    for(let i in _categorys)
    {
        const _categoryi = _categorys[i];
        //
        for(let j in qunc)
        {
            const _categoryj = qunc[j];
            await redis_sd28_pub('sd28-site-room', JSON.stringify({
                controller: 'game_qun_auto_bet_show',
                game: _categoryj+''+_categoryi,
                data: [ 
                    2, 
                    dayjs().format('HH:mm:ss'),
                    (_category_name[_categoryi]||'')+'，第 '+peroids+' 期，开始下注！',
                    peroids,
                    'open'
                ]
            }));
            // 
            const _next = await getNextPeroidsTime(category, time);
            if(_next && _next.next > 0)
            {
                let __time = parseInt(_next.next-_category_time);
                __time = __time>0 ? __time : 1;
                await redis_lottery_setex('gqabs_'+_categoryj+'_'+_categoryi+'_'+peroids, __time, '1')
            }
        }
    }
}
// 发送开奖
const sendOpen = async(category, d, old) => 
{
    // 开奖处理列表 -----------------------------------------------
    await redis_lottery_lpush('bet_open_list', JSON.stringify({
        category,
        ...d
    }));
    // 如果是补奖则不继续执行
    if(old) return;
    // sd28 网站通知
    await redis_sd28_pub('sd28-site-room', JSON.stringify({
        controller: 'game_lottery_open',
        category,
        peroids: d.peroids
    }));
}
// 
module.exports = 
{
    gameIn,
    lotteryIn,
    lotteryUpdate
};