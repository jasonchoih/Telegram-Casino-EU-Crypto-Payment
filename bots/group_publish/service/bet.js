const { async_set_auto_bot, async_get_auto_bot, async_set_telegram, async_get_telegram, redis_1_lottery_fou, get_1_List_fou_new } = require('../plugin/redis');
const { get_category_type, get_jg, check_jg} = require('../tool/lottery');
const { checkForSpecificPK } = require('./betpksc');
// const { people } = require('./bots');
// 
const _dsdx = {
    '单': [1,3,5,7,9,11,13,15,17,19,21,23,25,27],
    '双': [0,2,4,6,8,10,12,14,16,18,20,22,24,26],
    '大': [14,15,16,17,18,19,20,21,22,23,24,25,26,27],
    '小': [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
    '中': [10,11,12,13,14,15,16,17],
    '边': [0,1,2,3,4,5,6,7,8,9,18,19,20,21,22,23,24,25,26,27],
    '大单': [15,17,19,21,23,25,27],
    '小单': [1,3,5,7,9,11,13],
    '大双': [14,16,18,20,22,24,26],
    '小双': [0,2,4,6,8,10,12],
    '大边': [18,19,20,21,22,23,24,25,26,27],
    '小边': [0,1,2,3,4,5,6,7,8,9]
}
// 
const dbz = {
    "豹子": 'bao',
    "顺子": 'shun',
    "对子": 'dui',
    "半子": 'ban',
    "杂子": 'za'
}
// 
const _type_num_val_odd = {
    "0":[1000,1],
    "1":[333.33,3],
    "2":[166.67,6],
    "3":[100,10],
    "4":[66.66,15],
    "5":[47.61,21],
    "6":[35.71,28],
    "7":[27.77,36],
    "8":[22.22,45],
    "9":[18.18,55],
    "10":[15.87,63],
    "11":[14.49,69],
    "12":[13.69,73],
    "13":[13.33,75],
    "14":[13.33,75],
    "15":[13.69,73],
    "16":[14.49,69],
    "17":[15.87,63],
    "18":[18.18,55],
    "19":[22.22,45],
    "20":[27.77,36],
    "21":[35.71,28],
    "22":[47.61,21],
    "23":[66.66,15],
    "24":[100,10],
    "25":[166.66,6],
    "26":[333.33,3],
    "27":[1000,1]
}
// 
const _lotterys = {
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
// 
const getJgText = (d) =>
{
    const jgTxt =  {
        //
        cd: '车道',
        gyh: '冠亚和',
        // 
        long: '龙',
        hu: '虎',
        // 
        bao: '豹',
        shun: '顺',
        dui: '对',
        ban: '半',
        za: '杂',
        // 
        da: '大',
        xiao: '小',
        dan: '单',
        shuang: '双',
        dadan: '大单',
        dashuang: '大双',
        xiaodan: '小单',
        xiaoshuang: '小双',
        jida: '极大',
        jixiao: '极小',
    }
    if(!jgTxt[d]) return d;
    return jgTxt[d]
}

// 
const deSh = async(m, type) => 
{
    let _r = {};
    let _d = _dsdx[type];
    for(let i in _d)
    {
        let _i = _d[i];
        _r[_i] = _type_num_val_odd[_i][1];
    }
    // 
    let s = 0;
    let r = {};
    for(let i in _r) s+=parseInt(_type_num_val_odd[i][1]);
    // 
    let _s = m/s;
    // console.log(_s);
    for(let i in _r) r[i] = parseInt(_type_num_val_odd[i][1] * _s);
    return r
}
// 
const nTom = (n) =>
{
    n = n+'';
    if(n==0) return '0';
    return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => 
    {
        return $1 + ",";
    });
}
// 
const shuffleArray = async(array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}
// 
const checkForSpecificKeys = async(inputStr) => 
{
    const bets = [];
    for(let i in _dsdx) bets.push(i);
    // 
    const pairs = {};
    const pair_regex = new RegExp(bets.map(x => `(${x})\\d+`).join('|'), 'g');
    const pair = inputStr.match(pair_regex);
    // 
    if (pair && pair.length > 0) {
        pair.forEach(match => {
            const key = match.match(/[^0-9]+/)[0];
            const value = parseInt(match.match(/\d+/)[0], 10) * 1000;
            if (value > 0) {
                if (pairs[key]) pairs[key] += value;
                else pairs[key] = value;
            }
            
        })
    }
    //
    const singles = (inputStr.match(/(\d+)押(\d{1,2})/g) || []).reduce((acc, match) => 
    {
        const [_, amount, number] = match.match(/(\d+)押(\d{1,2})/);
        const parsedAmount = parseInt(amount) * 1000;
        const parsedNumber = parseInt(number);
        // 
        if (parsedAmount > 0 && parsedNumber >= 0 && parsedNumber <= 27) {
            acc[parsedNumber] = (acc[parsedNumber] || 0) + parsedAmount;
        }
        return acc;
    }, {});
    // 
    const vals = {};
    if(Object.keys(pairs).length >0){
        for(let i in pairs){
            const r = await deSh(pairs[i], i);
            for(let j in r){
                if (vals[j]) vals[j] += r[j]
                else vals[j] = r[j];
            }
        }
    }
    if(Object.keys(singles).length >0){
        for(let i in singles){
            if (vals[i]) vals[i] +=singles[i] 
            else vals[i] =singles[i]
        }
    }
    // 
    if(Object.keys(vals).length===0)
    {
        const pairs = {};
        const pair_regex = new RegExp(Object.keys(dbz).map(x => `(${x})\\d+`).join('|'), 'g');
        const pair = inputStr.match(pair_regex);
        // 
        if (pair && pair.length > 0) {
            pair.forEach(match => {
                const key = match.match(/[^0-9]+/)[0];
                const value = parseInt(match.match(/\d+/)[0], 10) * 1000;
                if(value > 0){
                    if (pairs[dbz[key]]) pairs[dbz[key]] += value;
                    else pairs[dbz[key]] = value;
                }
            })
        }
        return { vals: pairs, type: 36 }
    }
    return { vals, type: 28 };
};
// 
const maskNumber = (number) =>
{
    const numberString = number.toString();
    const firstThreeDigits = numberString.slice(0, 3);
    const lastThreeDigits = numberString.slice(-3);
    const numToMask = numberString.length - 6;
    const maskedString = firstThreeDigits + '*'.repeat(numToMask) + lastThreeDigits;
    return maskedString;
}
// 
const distributeAmount = async(people, totalAmount, category) =>
{
    const numberOfPeople = people.length;
    const minAmount = 1; 
    const maxAmount = Math.floor(totalAmount / numberOfPeople);
    const distributedAmounts = [];
    let distributedTotal = 0;
    // 
    const arr = [ 
        '单','双','大', '小','中', '边','大单','小单','大双','小双','大边','小边', '豹子', '顺子', '对子', '半子', '杂子', // => 17
        // '押0', '押1', '押2', '押3', '押4', '押5', '押6', '押7', '押8', '押9', '押10', '押11', '押12', '押13', '押14', '押15', '押16', '押17','押18', '押19',  '押20', '押21', '押22', '押23', '押24','押25', '押26','押27',
    ];
    const arr_pk = [ '单','双','大', '小', '龙', '虎' ];
    const arr_gyh = [ '单','双','大', '小' ];
    // 
    for (let i = 0; i < numberOfPeople; i++) 
    {
        const randomAmount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
        const randomIndex = Math.floor(Math.random() * arr.length);
        const randomPKIndex = Math.floor(Math.random() * arr_pk.length);
        const randomGYHIndex = Math.floor(Math.random() * arr_gyh.length);
        // 
        const remainingAmount = totalAmount - distributedTotal;
        const distributed = Math.min(randomAmount, remainingAmount);
        const roundedAmount = Math.ceil(distributed / 5) * 5;
        // 
        const cds = ['车道', '冠亚和'];
        const cd_random = Math.floor(Math.random() * cds.length);
        const cd = cds[cd_random] == '车道' ? cds[cd_random] + '' +(Math.floor(Math.random() * 10) + 1 ) + ' ' + arr_pk[randomPKIndex] : cds[cd_random] + ' ' + arr_gyh[randomGYHIndex];
        // 
        const person = people[i];
        const amountBet = Math.ceil(distributed / 100) * 100;
        distributedAmounts.push({
            telegram_id: maskNumber(person.id),
            name: person.name, // name: '*'.repeat(person.name.length),
            amount: category=='pk' ? cd + '' +  amountBet : arr[randomIndex] + '' + amountBet,
            bet: category=='pk' ? await checkForSpecificPK(cd + '' +  amountBet) : await checkForSpecificKeys(arr[randomIndex] + '' + amountBet) 
        });
        distributedTotal += roundedAmount;
    }
    return distributedAmounts;
}
// 
const getBots = async(category) =>
{
    const max = 70; // => people
    const max_amount = 800_000;  // => money
    const amount = Math.floor(Math.random() * (max_amount - 10_0000 + 1)) + 10_000;
    // 
    const bots = await async_get_telegram('telegram_auto_bots');
    // // 
    const distribution = await distributeAmount(bots, amount, category);
    const _bots = await shuffleArray(distribution);
    return _bots.slice(0,Math.floor(Math.random() * max) + 1)
}
// 
const getBotsResult = async(d) =>
{
    const { category, peroids, lottery, bots } = d;
    // 
    const _cts = await get_category_type(category, peroids);
    let ct;
    for(let i in _cts){
        let _i = _cts[i];
        if(_i.category==category) ct = category =='pk' ? ['sc','gyh','10','22','gj','lh'] :_i.type
    }
    // console.log({category, ct})
    const _jg = await get_jg(category, ct, lottery);
    // if(category=='pk') console.log(_jg)
    let results = '';
    for(let i in bots){
        let v = bots[i]
        const { vals, type } = v.bet;
        // console.log({
        //     category, vals, type
        // })
        const wins = await check_jg(category, type, JSON.stringify(vals), _jg);
        if(wins.length>0) {
            results += v.name + "【" + v.telegram_id + "】" + v.amount + '\n'
        }
    }
    // if(category=='pk') console.log(results)
    return results
}
// 
// const test = async() =>
// {
//     const category_bot = 'jnd'
//     const bots = await getBots(category_bot);
//     console.log(bots);
//     //
//     const lottery = await async_get_auto_bot(category_bot+'_latest');
//     console.log(lottery)
//     // 
//     const { category, peroids } = lottery;
//     await getBotsResult({
//         category,
//         peroids,
//         lottery,
//         bots
//     })
// }
// test()
// 
const gameInfo = {
    bj:[
        '台湾 BINGOBINGO 宾果',
        'https://www.taiwanlottery.com.tw/Lotto/BINGOBINGO/drawing.aspx',
        'BINGO BINGO宾果宾果之开奖方式采用电脑随机开奖，并于全国电脑型彩卷投注站之电视荧幕播出当期开出奖号。开奖时间: 07:00 — 24:00 开奖频率: 每5分钟开奖一次，一天开奖204期。'
    ],
    dd:[
        '台湾 BINGOBINGO 蛋蛋',
        'https://www.taiwanlottery.com.tw/Lotto/BINGOBINGO/drawing.aspx',
        'BINGO BINGO宾果宾果之开奖方式采用电脑随机开奖，并于全国电脑型彩卷投注站之电视荧幕播出当期开出奖号。开奖时间: 07:00 — 24:00 开奖频率: 每5分钟开奖一次，一天开奖204期。'
    ],
    jnd:[
        '加拿大快乐8',
        'https://www.playnow.com/keno/winning-numbers',
        'BCLC快乐彩经加拿大卑斯省授权由英属哥伦比亚彩票机构发行，由卑斯省博奕管理条例统一控管，并由该机构执行营运与承销。全年不休。开奖时间: 17:00 — 18:00 开奖频率: 每3分半钟开奖一次，一天开奖228期。'
    ],
    jnc:[
        '加拿大西部快乐8',
        'http://www.wclc.com/winning-numbers/keno.htm?drawNum',
        'WCLC由西加拿大亚彩票机构发行，加拿大博奕管理条例统一控管，由并由该机构执行营运与承销。快乐彩全年365天不间断。开奖时间: 19:24 — 14:24 开奖频率: 每5分钟开奖一次，一天开奖179期。'
    ],
    pk:[
        '加拿大 PK 系列',
        'https://www.playnow.com/keno/winning-numbers',
        '采用加拿大KENO开奖号码源，经由SHA256后，得出车手顺序，再进行十进制转换得出数字为时速，最后进行时速排名，即为开奖号码，每3分半钟一期，每天228期'
    ],
    btc:[
        '比特币快乐8',
        'https://www.blockchain.com/btc/unconfirmed-transactions',
        '采用每分钟比特币最新交易数据为准，每一枚开奖交易码都可以进行兑奖查询核对，公开公平公正。开奖时间: 00:00 — 24:00 开奖频率: 每1分钟开奖一次'
    ],
    kr:[
        '韩国快乐8',
        '-',
        '采用北韩福彩中心KR8数据，该开奖号码官网已停止在网络开奖方式，请玩家参考投注站或其它网络资源。开奖时间: 00:00 — 24:00 开奖频率: 每1.5分钟开奖一次'
    ],
    au:[
        '澳洲快乐8',
        'https://www.keno.com.au/live-draw',
        'ACTTAB快乐彩由澳洲首都商业区授权ACTTAB机构来执行营运与承销，澳洲ACTTAB公司成立于1964年，澳大利亚首都直辖的大型彩票公司。开奖时间: 00:00 — 24:00 开奖频率: 每2分钟40秒开奖一次，一天开奖543期。'
    ],
    elg:[
        '俄勒冈快乐8',
        'https://www.oregonlottery.org/jackpot/keno',
        '俄勒冈开奖方式采用电脑随机开奖，并于官网上直播出当期开出奖号，所有开奖流程和结果保证公开、公平和公正。全天不休。开奖时间: 00:00 — 24:00 开奖频率: 每4分钟开奖一次，一天开奖360期。'
    ],
    slfk:[
        '斯洛伐克keno快乐8',
        'https://eklubkeno.etipos.sk/Archive.aspx',
        '斯洛伐克keno快乐8是由斯洛伐克共和国财政部独家授权-TIPOS国家乐彩公司营销。TIPOS国家乐彩公司于1993年开始经营，快乐彩全年不休。开奖时间: 05:00 — 23:50 开奖频率: 每5分钟开奖一次，一天开奖226期。'
    ]
}
// 
module.exports = {
    gameInfo,
    getBots,
    maskNumber,
    getBotsResult,
    nTom,
    getJgText
}