// 
const { isInGame, returnNewLottery } = require('../service/game');
const dayjs = require("dayjs");
const { timeShow, gamePeroidsTime } = require('../service/gameTool');
// 
// w: {
//     game: 'btc28',
//     category: 'btc',
//     type: 28,
//     path: 'game/jg',
//     __tk: '07eaa5825a8a2b4d4519fef878f182a24f90693fe18304ea193ea11ac31e0715dfabe53d4af42a5f68ece2dd8acf1f99561dc1f41b285ca8f1849fc683bb16bb',
//     id: 666666,
//     uuid: '1IZq9s539U3cPzsQh'
// } 
// m: {
//     controller: 'game_open',
//     category: 'btc',
//     peroids: 1682902,
//     number: '7,9,18,20,26,26,29,31,35,37,49,52,54,55,61,65,66,68,73,75',
//     time: '2021-04-15 04:35:00',
//     des: 'f57c1df64a917666ad3a7944613a6a4e1ecfc2479273929a165f9954b952a331'
// }  
const game_open_now = async(w, m, u) => 
{
    // console.log(w,m);
    if(!w || !m || !w.game) return false;
    if(!isInGame(w.category, w.type)) return false;
    if(w.category!=m.category) return false;
    //
    const _has_number = w.path=='home/game' ? false : true;
    let Lottery = {};
    let name = 'Lottery'+w.category+''+w.type;
    Lottery[name] = await returnNewLottery(m, w.category, w.type, _has_number);
    // 
    return { ...Lottery };
}
//
const game_open_last = async(w, m, u) => 
{
    if(!w || !m || !w.game) return false;
    if(!isInGame(w.category, w.type)) return false;
    if(w.category!=m.category) return false;
    // 
    let Lottery = {};
    let name = 'Lottery'+w.category+''+w.type+'_add';
    let _n = 3;
    const game_time = gamePeroidsTime[w.category];
    // console.log(game_time);
    Lottery[name] = [
        parseInt(m.peroids)+_n,
        await timeShow(m.category, dayjs(m.time).add(game_time[0]*_n, 'second').format('YYYY-MM-DD HH:mm:ss') )
    ];
    return { ...Lottery };
}

module.exports = {
    game_open_now,
    game_open_last
}