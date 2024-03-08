//
const dayjs = require('dayjs');
const { USERBETDATA, USERDAYDATA, USERSUM } = require('../sequelize/db28');
// 
const { 
    redis_2_pub, 
    redis_1_list,
    redis_1_lset
} = require('../tool/redis');
// 
const { percent } = require('../tool/tool');
const { tgBetAdd } = require('./usertgfl');
// 

// 获取单游戏当天投注情况
const getGameBetData = async(d) => 
{
    const { user_id, category, type } = d;
    //
    const _bet_time = dayjs().format('YYYY-MM-DD');
    const _user_bet_data = await USERBETDATA.findOne({
        attributes: ['bet','win','pn','wn'],
        where:{
            user_id,
            category,
            type,
            time: _bet_time
        }
    });
    if(!_user_bet_data) return [0,0,0,0,0];
    return [
        _user_bet_data.bet, // 投注金豆
        _user_bet_data.pn, // 投注期数
        _user_bet_data.wn, // 胜利期数
        parseInt(_user_bet_data.win), // 盈亏
        percent(_user_bet_data.wn,_user_bet_data.pn) // 胜率
    ];
}
// 更新投注情况
const UserBetDataIn = async(d) => 
{
    let { user_id,category,type,dou,_is_ls,_is_bet_ed,parent,transaction } = d;
    //
    dou = parseInt(dou);
    const time = dayjs().format('YYYY-MM-DD');
    const _time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    // 今日游戏投注记录
    const _user_bet = await USERBETDATA.findOne({where:{user_id,category,type,time}}, { transaction });
    if(_user_bet)
    {
        let _ubd = {};
        _ubd['bet'] = parseInt(_user_bet.bet)+dou;
        if(_is_bet_ed==1) _ubd['pn'] = parseInt(_user_bet.pn)+1;
        await USERBETDATA.update(_ubd, {
            where:{ id: _user_bet.id }
        }, { transaction });
    }else{
        await USERBETDATA.create({
            user_id,
            category,
            type,
            bet: dou,
            pn: 1,
            time
        }, { transaction });
    }
    // 今日总体数据记录 - 流水
    const _user_day = await USERDAYDATA.findOne({where:{user_id,time}}, { transaction });
    if(_user_day)
    {
        let _updata_user_day_data = { bet: parseInt(parseInt(_user_day.bet)+dou) };
        if(_is_ls==1) _updata_user_day_data['ls'] = parseInt(parseInt(_user_day.ls)+dou);
        await USERDAYDATA.update(_updata_user_day_data, {
            where:{ id: _user_day.id }
        }, { transaction });
    }else{
        let _create_user_day_data = {
            user_id,
            bet: dou,
            time
        };
        if(_is_ls==1) _create_user_day_data['ls'] = dou;
        await USERDAYDATA.create(_create_user_day_data, { transaction });
    }
    // 总体情况
    const _user_sum = await USERSUM.findOne({where:{user_id}}, { transaction });
    if(_user_sum)
    {
        let _updata_user_sum_data = { bet: parseInt(_user_sum.bet)+dou };
        if(_is_ls==1) _updata_user_sum_data['ls'] = parseInt(_user_sum.ls)+dou;
        await USERSUM.update(_updata_user_sum_data, {
            where:{ id: _user_sum.id }
        }, { transaction });
    }else{
        let _create_user_sum_data = {
            user_id,
            bet: dou,
            time: _time
        };
        if(_is_ls==1) _create_user_day_data['ls'] = dou;
        await USERSUM.create(_create_user_sum_data, { transaction });
    }
    // 推广返利
    if(_is_ls==1 && parent)
    {
        await tgBetAdd({
            user_id: parent,
            dou,
            time: _time,
            transaction
        });
    }
}
// 用户投注检查 
const UserBetDataCheck = async(d) => 
{
    const { user_id,category,type,time } = d;
    // 
    const _user_bet = await USERBETDATA.findOne({attributes:['id'],where:{user_id,category,type,time}});
    if(!_user_bet)
    {
        await USERBETDATA.create({ 
            user_id,
            category,
            type,
            bet:0,
            win_dou:0,
            win:0,
            pn:0,
            wn:0,
            time
        });
    }
}
// 用户统计检查 
const UserDaySumCheck = async(d) => 
{
    const { user_id, time } = d;
    // 
    const _user_day = await USERDAYDATA.findOne({attributes:['id'],where:{user_id,time}});
    if(!_user_day)
    {
        await USERDAYDATA.create({ 
            user_id,
            exchange_num: 0,
            exchange: 0,
            exchange_rate: 0,
            time
        });
    }
    const _user_sum = await USERSUM.findOne({attributes:['id'],where:{user_id}});
    if(!_user_sum)
    {
        await USERSUM.create({
            user_id,
            exchange_num: 0,
            exchange: 0,
            exchange_rate: 0,
            time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        });
    }
}
// 更新四期投注情况
const lottery_fou_fix = 'lottery_fou_';
const fouChange = async(category,type,peroids,dou,_bet_num,_bet_dou_sum) => 
{
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
    let _game = _lotterys[category];
    // 
    const _n = lottery_fou_fix+''+_game;
    const _fou = await redis_1_list(_n, 0, -1);
    const _this = _fou.find(v=>v.peroids==peroids);
    // 
    if(_this)
    {
        const _index = _fou.findIndex(v=>v.peroids==peroids);
        if(_index>-1)
        {
            let p = _this.p;
            const _pd = p[category][type];
            // 
            const _pc = [
                parseInt(parseInt(_pd[0])+parseInt(dou)),
                parseInt(parseInt(_pd[1])+parseInt(_bet_num)),
                0
            ];
            p[category][type] = _pc;
            // 
            await redis_1_lset(_n, _index, JSON.stringify({
                peroids: _this.peroids,
                time: _this.time,
                p
            }));
            // 去除
            // redis_2_pub.publish('sd28-site-room', JSON.stringify({
            //     controller: 'game_lottery_bet_update',
            //     category,
            //     type,
            //     peroids,
            //     p: [
            //         ..._pc,
            //         _bet_dou_sum
            //     ]
            // }));
        }
    }
}
// 
module.exports = 
{
    getGameBetData,
    UserBetDataIn,
    //
    fouChange,
    // 
    UserBetDataCheck,
    UserDaySumCheck
}