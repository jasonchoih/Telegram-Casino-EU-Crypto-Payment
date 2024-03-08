// 
const dayjs = require("dayjs");
const { redis_sd28_pub, redis_lottery_subscribe, redis_us_subs, client_us } = require('./tool/redis');
// 
// 发送通知 
const _send_qun = async(d) => 
{
    // 
    const _d = d.split('_');
    const [ mode, category, type, peroids ] = _d||[]; 
    // 
    // console.log(mode, category, type, peroids);
    // 
    if(!mode || mode!=='gqabs') return;
    // 
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
    // 
    await redis_sd28_pub('sd28-site-room', JSON.stringify({
        controller: 'game_qun_auto_bet_show',
        game: category+''+type,
        data: [ 
            2, 
            dayjs().format('HH:mm:ss'),
            (_category_name[type]||'')+'，第 '+peroids+' 期，停止投注，准备开奖！',
            peroids,
            'wait'
        ]
    }));
}
// 群停止投注通知
const sub_one = async() => 
{
    const regex = new RegExp('gqabs_q28_btc');
    // 
    redis_lottery_subscribe.subscribe(`__keyevent@0__:expired`, async() =>
    {
        redis_lottery_subscribe.on('message', async(info, msg) => 
        {
            // console.log({info, msg});
            try {
                if (regex.test(msg)) {
                    redis_us_subs.ping((err, reply) => {})
                    client_us.ping((err, reply) => {})
                }
                await _send_qun(msg);
            } catch (error) {
                
            }
        })
    });
}
// 
sub_one();