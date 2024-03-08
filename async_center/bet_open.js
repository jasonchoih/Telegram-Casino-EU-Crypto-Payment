//
const { redis_1_brpop, LooterySubDo, redis_1_list, redis_1_lset, redis_2_pub, get_2, set_3 } = require('./tool/redis');
const { USERBET, USERBETAUTO } = require('./sequelize/db28');
const { get_category_type, get_jg, get_odds, check_jg, qunOddCheck } = require('./tool/lottery');
// 
const sub_list = 'bet_open_list';
//
const lotteryIn = async(d) => 
{
    const { category, peroids } = d;
    const _cts = await get_category_type(category, peroids);
    // 
    for(let i in _cts)
    {
        let _i = _cts[i];
        await LotteryOpen(_i, d);
    }
}
// low
const LotteryOpen = async(d,e) => 
{
    const { category, type, peroids } = d;
    //
    const _jg = await get_jg(category, type, e);
    // console.log('_jg', _jg)
    // 处理已投注开奖
    await open_list(d, _jg);
    // 处理自动投注
    await autobet(d, _jg);
}
// 开奖列表
const open_list = async(d, _jg) => 
{
    const { category, peroids } = d;
    // 
    const _bet_list = await USERBET.findAll({
        attributes: ['id','user_id','type','dou','vals','mode','time'],
        where:{
            status:1,
            ...d
        }
    });
    if(_bet_list.length<=0)
    {
        return;
    }
    // console.log(_bet_list)
    //
    const gameset = await get_2('GameSet');
    const max_open = parseInt(gameset['max-open']);
    // 
    let _wins = [];
    let _loses = [];
    let _need_odd_type = [];
    // 
    let _win_num = 0;
    // 
    for(let i in _bet_list)
    {
        let _bet_list_i = _bet_list[i];
        const wins = await check_jg(category, _bet_list_i.type, _bet_list_i.vals, _jg);
        // console.log('wins', wins)
        if(wins.length>0)
        {
            _need_odd_type.push({
                category,
                type: _bet_list_i.type,
                peroids
            });
            // 
            _wins.push({
                id: _bet_list_i['id'],
                user_id: _bet_list_i['user_id'],
                category,
                type: _bet_list_i.type,
                peroids,
                wins,
                vals: _bet_list_i.vals,
                mode: _bet_list_i.mode,
                _bet_dou: _bet_list_i.dou,
                _bet_time: _bet_list_i.time
            });
            _win_num++;
        }else{
            _loses.push({
                id: _bet_list_i['id'],
                user_id: _bet_list_i['user_id'],
                category,
                type: _bet_list_i.type,
                dou: _bet_list_i.dou,
                peroids,
                mode: _bet_list_i.mode,
                _bet_time: _bet_list_i.time
            });
        }
    }
    // 
    if(_wins.length>0)
    {
        const _odd = await get_odds(_need_odd_type);
        // console.log(_wins, _odd);
        // 
        let _new_wins = [];
        for(let i in _wins)
        {
            let _winsi = _wins[i];
            let _x_wins = {}; 
            // 
            let win_dou = 0;
            for(let j in _winsi.wins)
            {
                let _winsj = _winsi.wins[j];
                // console.log('_winsj',_winsj)
                // 检查是否群玩法赔率
                let _this_odd = await qunOddCheck(
                    _winsi.category, 
                    _winsi.type, 
                    _winsj[0],
                    _jg, 
                    _odd[_winsi.type][_winsj[0]]
                );
                // 
                // console.log('----------------333333333333----------------',_this_odd);
                // 
                let _this_win_dou = parseInt(parseInt(_winsj[1])*parseFloat(_this_odd));
                _this_win_dou = _this_win_dou>max_open ? max_open : _this_win_dou;
                //  
                _x_wins[_winsj[0]] = [_this_odd,_this_win_dou];
                win_dou+=_this_win_dou;
            }
            win_dou = win_dou>max_open ? max_open : win_dou;
            // console.log('_new_wins for loop', _new_wins)
            _new_wins.push({
                ..._winsi,
                wins: _x_wins,
                win_dou,
                win_num: _win_num
            });
        }
        // console.log('_new_wins before open_in', _new_wins)
        await open_win(_new_wins);
    }
    if(_loses.length>0)
    {
        await open_lose(_loses);
    }
}
// 赢了
const open_win = async(d) => 
{
    for(let i in d)
    {
        await LooterySubDo({ 
            path:[ 'open', 'win' ],
            data: d[i]
        });
    }
}
// 输了
const open_lose = async(d) => 
{
    for(let i in d)
    {
        await LooterySubDo({
            path:[ 'open', 'lose' ],
            data: d[i]
        });
    }
}
// 处理自动开奖
const autobet = async(d, jg) => 
{
    const { category, type, peroids } = d;
    const _no_category_auto_arr = [ 'q214','q28' ];
    if(_no_category_auto_arr.find(v=>v==category)) return;
    // 
    const _auto_list = await USERBETAUTO.findAll({
        attributes: [
            'id','user_id','category','type','start_peroids','end_peroids','min_dou','max_dou',
            'mode','vals','peroids','pn','dou','win'
        ],
        where:{
            status:2,
            category
        }
    });
    if(_auto_list.length<=0)
    {
        // console.log('没有自动投注，无需处理！'); 
        return;
    }
    for(let i in _auto_list)
    {
        let _auto_list_i = _auto_list[i];
        await LooterySubDo({ 
            path:[ 'autobet', 'go' ],
            data: {
                ..._auto_list_i.dataValues,
                // 
                start_peroids: parseInt(_auto_list_i.start_peroids),
                end_peroids: parseInt(_auto_list_i.end_peroids),
                peroids: parseInt(_auto_list_i.peroids),
                vals: JSON.parse(_auto_list_i.vals),
                // 
                _jg: jg[_auto_list_i.type][0],
                _peroids: peroids
            }
        });
    }
}
// 监听
const startWaitMsg = async() => 
{
    while(true) 
    {
        let res = null;
        try {
            res = await redis_1_brpop(sub_list, 0);
            // console.log(res);
            // 
            const d = JSON.parse(res[1]);
            // 
            const { category } = d;
            // console.log(category)
            // await set_3(category+'_latest', JSON.stringify(d))
            // 
            await lotteryIn(d);
        }
        catch(err) {
            // console.log(err)
            continue
        }
        // const d = JSON.parse(res[1]);
        // await lotteryIn(d);
    }
}
// 
startWaitMsg();