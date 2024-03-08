// 
const dayjs = require('dayjs');
// 
const { sequelize,Transaction,Op, USERS, USERDATA, USERBET, USERLOGDOU, USERBETMODE, USERBETAUTO } = require('../../sequelize/db28');
const { admin_to_user, redis_1_list, redis_1_lset, redis_2_pubs } = require('../../tool/redis');
const { nTom,GameName,percent } = require('../../tool/tool');
const { getGameBetData,UserBetDataIn,fouChange,UserBetDataCheck,UserDaySumCheck } = require('../../service/usersum');
const { TCL, TCC } = require('../../service/transaction');
const { tgBetAdd } = require('../../service/usertgfl');
//
// 自动投注
const go = async(d) => 
{
    // console.log(d);
    if(!d) return;
    const { user_id, mode, end_peroids, _peroids } = d;
    if(!mode) return;
    // 期数判断 - 放置于开奖时候检查
    if(_peroids>end_peroids)
    {
        await peroidsOver(d);
        return;
    };
    // 模式处理
    if(mode==1)
    {
        await mode_shuying(d);
        return;
    }
    await mode_duihao(d);
}
// 期数已到结束
const peroidsOver = async(d) => 
{
    let { id,user_id,category,type } = d;
    //
    await (async(transaction)=>
    {
        await USERBETAUTO.update({
            status: 30, // 不在期数范围内
        },{
            where:{ id }
        }, { transaction });
    });
}
// 输赢模式
const mode_shuying = async(d) => 
{
    let { id,user_id,category,type,start_peroids,end_peroids,min_dou,max_dou,vals,peroids,pn,dou,win,_jg,_peroids,time } = d;
    // 
    const _user = await USERS.findOne({ 
        attributes: ['nick','parent'], 
        where:{ id: user_id } 
    });
    if(!_user) return;
    // 
    const _this_peroids = parseInt(_peroids)+1;
    // 投注记录、统计检查
    const _time = dayjs().format('YYYY-MM-DD');
    await UserBetDataCheck({
        user_id,
        category,
        type,
        time: _time
    });
    await UserDaySumCheck({
        user_id,
        time: _time
    });
    //
    let _re = await TCL(async(transaction)=>
    {
        // 金额
        const _user_data = await USERDATA.findOne({ 
            attributes: ['dou'], 
            where:{ user_id } 
        }, { transaction });
        const _user_dou = parseInt(_user_data.dou);
        // 金额豆低于下限
        if(_user_dou<=parseInt(min_dou))
        {
            await USERBETAUTO.update({
                status: 31,
            },{
                where:{ id }
            }, { transaction });
            return 1;
        }
        // 金额豆高于上限
        if(_user_dou>=parseInt(max_dou))
        {
            await USERBETAUTO.update({
                status: 32,
            },{
                where:{ id }
            }, { transaction });
            return 2;
        }
        //
        const _vn = vals.length;
        const _va = parseInt(pn)%_vn;
        let _vb = 0; // 使用第几种模式，默认赢
        if(pn>0)
        {
            const _user_bet = await USERBET.findOne({
                attributes: ['id'], 
                where:{ 
                    user_id,
                    category,
                    type,
                    peroids: _peroids,
                    mode: 2,
                    status: 2
                } 
            }, { transaction });
            //
            if(!_user_bet)
            {
                _vb = 1; // 使用第几种模式，输
            }
        }
        const _mode_bet_id = vals[_va][_vb];
        const _user_bet_mode = await USERBETMODE.findOne({ 
            attributes: ['vals','sum','ls'], 
            where:{ 
                id: _mode_bet_id,
                user_id,
                category,
                type
            } 
        }, { transaction });
        // 投注模式不存在
        if(!_user_bet_mode)
        {
            await USERBETAUTO.update({
                status: 33,
            },{
                where:{ id }
            }, { transaction });
            //
            return 3;
        }
        const _bet_sum = parseInt(_user_bet_mode.sum);
        // 金豆不足以投注
        if(_user_dou<_bet_sum)
        {
            await USERBETAUTO.update({
                status: 34,
            },{
                where:{ id }
            }, { transaction });
            return 4;
        }
        //
        const _user_dou_sum = parseInt(_user_dou-_bet_sum);
        // 投注记录
        const _user_bet_new = await USERBET.create({ 
            user_id,
            category,
            type,
            peroids: _this_peroids,
            num: Object.keys(JSON.parse(_user_bet_mode.vals)).length,
            dou: _bet_sum,
            vals: _user_bet_mode.vals,
            mode: 2,
            status: 1,
            ls: _user_bet_mode.ls,
            time
        }, { transaction });
        //
        await sequelize.query(
            'UPDATE `user_bet_auto` SET '+
            '`peroids`='+_this_peroids+', '+
            '`dou`=`dou` + '+_bet_sum+', '+
            '`pn`=`pn` + 1 '+
            'WHERE id='+id, 
            { transaction }
        );
        // 更新用户金额
        await USERDATA.update({ dou: _user_dou_sum }, { where:{
            [Op.and]: [
                { user_id }, 
                { dou: {[Op.gte]: 0} }
            ],
        }, transaction });
        // 金豆日志
        await USERLOGDOU.create({
            user_id,
            type: 3,
            mode: 1,
            num: _bet_sum,
            dou: _user_dou_sum,
            des: '自动投注 - '+await GameName(category,type)+',第 '+_peroids+' 期',
            time
        }, { transaction });
        // 更新投注情况
        await sequelize.query(
            'UPDATE `user_bet_data` SET '+
            '`bet`=`bet` + '+_bet_sum+', '+
            '`pn`=`pn` + 1 '+
            'WHERE user_id='+user_id+' and category="'+category+'" and type="'+type+'" and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_day_data` SET '+
            '`bet`=`bet` + '+_bet_sum+', '+
            '`ls`=`ls` + '+_user_bet_mode.ls+' '+
            'WHERE user_id='+user_id+' and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_sum` SET '+
            '`bet`=`bet` + '+_bet_sum+', '+
            '`ls`=`ls` + '+_user_bet_mode.ls+' '+
            'WHERE user_id='+user_id, 
            { transaction }
        );
        // 推广返利
        if(_user.parent)
        {
            await tgBetAdd({
                user_id: _user.parent,
                dou: _bet_sum,
                time,
                transaction
            });
        }
        //
        return {
            _user_dou_sum,
            _bet_sum,
            __vals: _user_bet_mode.vals
        }
    });
    // 
    if(!_re || [1,2,3,4,100].find(v=>v==_re)) return;
    const _user_id_uuid = _user.id+'-'+_user.uuid;
    let _game_win = {};
    _game_win['UserDayBetData'+category+''+type] = await getGameBetData({
        user_id,
        category,
        type
    });
    await admin_to_user({
        _user_id_uuid,
        data:{
            Auth:{
                dou: _re._user_dou_sum
            },
            ..._game_win
        }
    });
    await redis_2_pubs('sd28-admin-data', JSON.stringify({GameBet:[
        dayjs().format('YY-MM-DD HH:mm:ss'),
        2,
        user_id,
        _user.nick,
        category+'/'+type,
        _this_peroids,
        JSON.parse(_re.__vals),
        _re._bet_sum
    ]}));
    // setTimeout(async()=>{
        await fouChange(category,type,_this_peroids,_re._bet_sum,1,_re._bet_sum);
    // },200);
}
// 对号模式
const mode_duihao = async(d) => 
{
    let { id,user_id,category,type,start_peroids,end_peroids,min_dou,max_dou,vals,peroids,pn,dou,win,_jg,_peroids,time } = d;
    // 
    const _user = await USERS.findOne({ 
        attributes: ['nick','parent'], 
        where:{ id: user_id } 
    });
    if(!_user) return;
    // 
    const _this_peroids = parseInt(_peroids)+1;
    // 投注记录、统计检查
    const _time = dayjs().format('YYYY-MM-DD');
    await UserBetDataCheck({
        user_id,
        category,
        type,
        time: _time
    });
    await UserDaySumCheck({
        user_id,
        time: _time
    });
    // 
    let _re = await TCL(async(transaction)=>
    {
        // 金额
        const _user_data = await USERDATA.findOne({ 
            attributes: ['dou'], 
            where:{ user_id } 
        }, { transaction });
        const _user_dou = parseInt(_user_data.dou);
        // 金额豆低于下限
        if(_user_dou<=parseInt(min_dou))
        {
            await USERBETAUTO.update({
                status: 31,
            },{
                where:{ id }
            }, { transaction });
            return 1;
        }
        // 金额豆高于上限
        if(_user_dou>=parseInt(max_dou))
        {
            await USERBETAUTO.update({
                status: 32,
            },{
                where:{ id }
            }, { transaction });
            return 2;
        }
        //
        if(!vals[_jg])
        {
            return 21;
        }
        const _user_bet_mode = await USERBETMODE.findOne({ 
            attributes: ['vals','sum','ls'], 
            where:{ 
                id: vals[_jg],
                user_id,
                category,
                type
            } 
        }, { transaction });
        // 投注模式不存在
        if(!_user_bet_mode)
        {
            await USERBETAUTO.update({
                status: 33,
            },{
                where:{ id }
            }, { transaction });
            //
            return 3;
        }
        const _bet_sum = parseInt(_user_bet_mode.sum);
        // 金豆不足以投注
        if(_user_dou<_bet_sum)
        {
            await USERBETAUTO.update({
                status: 34,
            },{
                where:{ id }
            }, { transaction });
            return 4;
        }
        //
        const _user_dou_sum = parseInt(_user_dou-_bet_sum);
        // 投注记录
        const _user_bet_new = await USERBET.create({ 
            user_id,
            category,
            type,
            peroids: _this_peroids,
            num: Object.keys(JSON.parse(_user_bet_mode.vals)).length,
            dou: _bet_sum,
            vals: _user_bet_mode.vals,
            mode: 2,
            status: 1, 
            ls: _user_bet_mode.ls,
            time
        }, { transaction }); 
        //
        await sequelize.query(
            'UPDATE `user_bet_auto` SET '+
            '`peroids`='+_this_peroids+', '+
            '`dou`=`dou` + '+_bet_sum+', '+
            '`pn`=`pn` + 1 '+
            'WHERE id='+id, 
            { transaction }
        );
        // 更新用户金额
        await USERDATA.update({ dou: _user_dou_sum }, { where:{
            [Op.and]: [
                { user_id }, 
                { dou: {[Op.gte]: 0} }
            ],
        }, transaction });
        // 金豆日志
        await USERLOGDOU.create({
            user_id,
            type: 3,
            mode: 1,
            num: _bet_sum,
            dou: _user_dou_sum,
            des: '自动投注 - '+await GameName(category,type)+',第 '+_peroids+' 期',
            time
        }, { transaction });
        // 更新投注情况
        await sequelize.query(
            'UPDATE `user_bet_data` SET '+
            '`bet`=`bet` + '+_bet_sum+', '+
            '`pn`=`pn` + 1 '+
            'WHERE user_id='+user_id+' and category="'+category+'" and type="'+type+'" and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_day_data` SET '+
            '`bet`=`bet` + '+_bet_sum+', '+
            '`ls`=`ls` + '+_user_bet_mode.ls+' '+
            'WHERE user_id='+user_id+' and time="'+_time+'"', 
            { transaction }
        );
        await sequelize.query(
            'UPDATE `user_sum` SET '+
            '`bet`=`bet` + '+_bet_sum+', '+
            '`ls`=`ls` + '+_user_bet_mode.ls+' '+
            'WHERE user_id='+user_id, 
            { transaction }
        );
        // 推广返利
        if(_user.parent)
        {
            await tgBetAdd({
                user_id: _user.parent,
                dou: _bet_sum,
                time,
                transaction
            });
        }
        //
        return {
            _user_dou_sum,
            _bet_sum,
            __vals: _user_bet_mode.vals
        }
    });
    if(!_re || _re==100) return;
    // 
    if([1,2,3,4,21].find(v=>v==_re)) return;
    // 
    let _game_win = {};
    _game_win['UserDayBetData'+category+''+type] = await getGameBetData({
        user_id,
        category,
        type
    });
    const _user_id_uuid = _user.id+'-'+_user.uuid;
    await admin_to_user({
        _user_id_uuid,
        data:{
            Auth:{
                dou: _re._user_dou_sum
            },
            ..._game_win
        }
    });
    await redis_2_pubs('sd28-admin-data', JSON.stringify({GameBet:[
        dayjs().format('YY-MM-DD HH:mm:ss'),
        2,
        user_id,
        _user.nick,
        category+'/'+type,
        _this_peroids,
        JSON.parse(_re.__vals),
        _re._bet_sum
    ]}));
    // setTimeout(async()=>{
        await fouChange(category,type,_this_peroids,_re._bet_sum,1,_re._bet_sum);
    // },200);
}
// 
module.exports = {
    go
}