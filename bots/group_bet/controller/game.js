const { SubDo, get_2 } = require('../plugin/redis');
const { _bet_is_in_peroids } = require('../service/game');
const { math_abs, valsChange } = require('../service/tool');
const { USERS, USERBET } = require('../sequelize/db28');
// 
const bet = async(d) => 
{
    let { id, category, type, vals, peroids, telegram_chat, message_id, nick, telegram_id } = d;
    vals = await valsChange(vals);
    // 
    const sysbetmax = await get_2('sysbetmax');
    const sysbetmax_xg = sysbetmax && parseInt(sysbetmax[category+'-xg']) || 50000000;
    //
    const _user = await USERS.findOne({attributes:['role','betmax','status', 'uuid'],where:{id}});
    let _user_bet_maxs = '';
    if(_user.betmax) _user_bet_maxs = parseInt(_user.betmax)*1000;
    // 
    const gameset = await get_2('GameSet');
    const min_bet = parseInt(gameset['min-bet']);
    // 
    let sum = 0;
    for(let i in vals) sum+= await math_abs(vals[i]);
    if(sum<min_bet) return '投注至少在 '+min_bet+'豆 以上！';
    if(sum>sysbetmax_xg) return '超过单期最大投注额 '+sysbetmax_xg+' 豆，请修改！';
    if(_user_bet_maxs && sum>_user_bet_maxs) return '很抱歉，本次投注超过您的单期最大投注额 '+_user_bet_maxs+' 豆，请修改或联系客服！';
    // 
    const _is_in_peroids = await _bet_is_in_peroids({category, type, peroids});
    if(_is_in_peroids) return _is_in_peroids;
    // 
    const _userbet = await USERBET.findOne({attributes:['vals'],where:{user_id:id,category,type,peroids}}); 
    if(_userbet)
    {
        let oldsum = 0;
        let oldVals = JSON.parse(_userbet.vals);
        for(let i in oldVals) oldsum+=parseInt(oldVals[i]);
        let nowsum = sum + oldsum;
        if(nowsum>sysbetmax_xg) return '超过单期最大投注额 '+ sysbetmax_xg +' 豆，请修改！';
        //
        if(_user_bet_maxs && nowsum>_user_bet_maxs) return '很抱歉，本次投注超过您的单期最大投注额 '+_user_bet_maxs+' 豆，请修改或联系客服！';
    }
    // 
    await SubDo({ 
        path:[ 'game', 'bet' ],
        data:{ uuidkey: _user.uuid, id, category, type, vals, peroids, mode:1, telegram_chat, message_id, nick, telegram_id }
    });
}
// 
module.exports={
    bet
}