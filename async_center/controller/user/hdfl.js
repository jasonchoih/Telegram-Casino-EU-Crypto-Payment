// 
const dayjs = require('dayjs');
// const { admin_to_user } = require('../../tool/redis');
const { USERDATA, USERLOGDOU, USERHDFL, USERTGFL, USERDAYDATA } = require('../../sequelize/db28');
const { UserDaySumCheck } = require('../../service/usersum');
const { getHdfl, getYgz } = require('../../service/hdfl');
const { nTom } = require('../../tool/tool');
const { TCL,TCC } = require('../../service/transaction');
// 
const _names = {
    'HdflScfl': ['首充返利',61,1,'scfl'],
    'HdflTzfl': ['投注返利',62,2,'tzfl'],
    'HdflKsfl': ['亏损返利',63,3,'ksfl'],
    'HdflXxfl': ['下线推广',64,4,'xxfl']
}
// 
const go = async({ id, time}) => 
{
    const yestoday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    // 统计检查
    await UserDaySumCheck({
        user_id: id,
        time: yestoday
    });
    // 
    const { UserHdfl, UserHdflSum } = await getHdfl({ user_id: id, yestoday });
    //
    // if(!UserHdfl || !UserHdflSum || Object.keys(UserHdfl).length<=0 || UserHdflSum<=0)
    // {
    //     return '没有可领取项！'
    // }
    //
    let _re = await TCL(async(transaction)=>
    {
        const _user_data = await USERDATA.findOne({attributes:['id','dou'],where:{user_id:id}},{transaction});
        // 
        if(!_user_data) throw new Error(1);
        // 
        const dou = UserHdflSum;
        const _user_dou = _user_data.dou ? parseInt(_user_data.dou) : 0;
        let __user_dou = _user_dou;
        const _user_new_dou = parseInt( _user_dou + dou );
        //
        let _USERHDFL = [];
        let _USERLOGDOU = [];
        let _user_day_data_update = {};
        // 
        for(let i in UserHdfl)
        {
            __user_dou+= UserHdfl[i];
            //
            _USERHDFL.push({
                user_id: id,
                mode: 1,
                type: _names[i][2],
                num: UserHdfl[i],
                dou: __user_dou,
                time
            });
            _USERLOGDOU.push({
                user_id: id,
                type: _names[i][1],
                mode: 2,
                num: UserHdfl[i],
                dou: __user_dou,
                time
            });
            _user_day_data_update[_names[i][3]] = 2;
        }
        // 
        await USERDATA.update({ dou: _user_new_dou }, { where:{
            id: _user_data.id,
            user_id: id
        }, transaction });
        await USERDAYDATA.update(_user_day_data_update, { where:{
            user_id: id,
            time: yestoday
        }, transaction });
        // 
        await USERHDFL.bulkCreate(_USERHDFL, { transaction });
        await USERLOGDOU.bulkCreate(_USERLOGDOU, { transaction });
        // 
        if(UserHdfl['HdflXxfl'])
        {
            await USERTGFL.update({ bet:0 }, { where:{
                user_id: id
            }, transaction });
        }
        // 
        return {
            _user_new_dou,
            _user_dou
        }
    });
    // 
    if(!_re || _re==1) return '活动领取失败，请稍后再试！';
    // 
    return '领取完成，金豆已到账！您当前的余额：' + nTom(_re._user_new_dou) + "金豆 (之前：" + nTom(_re._user_dou) + " 金豆)"
}
// 
const ygz_go = async({ id, time}) => 
{
    const this_month = dayjs().startOf('month').format('YYYY-MM-DD'); // 本月，第一天
    // 统计检查
    await UserDaySumCheck({
        user_id: id,
        time: this_month
    });
    // 
    let UserYgz = await getYgz({ user_id: id, this_month });
    //
    if(!UserYgz || UserYgz<=0)
    {
        return {
            M:{c:'没有可领取项！'},
            UserYgzLoading:''
        }
    }
    const dou = parseInt(UserYgz); // 用户可领取金豆
    //
    let _re = await TCL(async(transaction)=>
    {
        const _user_data = await USERDATA.findOne({attributes:['id','dou'],where:{user_id:id}},{transaction});
        // 
        if(!_user_data) throw new Error(1);
        // 
        const _user_dou = _user_data.dou ? parseInt(_user_data.dou) : 0;
        const _user_new_dou = parseInt( _user_dou + dou );
        // 
        await USERDATA.update({ dou: _user_new_dou }, { where:{
            id: _user_data.id,
            user_id: id
        }, transaction });
        await USERDAYDATA.update({ygz:2}, { where:{
            user_id: id,
            time: this_month
        }, transaction });
        // 
        await USERHDFL.create({
            user_id: id,
            mode: 2,
            type: 5,
            num: dou,
            dou: _user_new_dou,
            time
        }, { transaction });
        await USERLOGDOU.create({
            user_id: id,
            type: 65,
            mode: 2,
            num: dou,
            dou: _user_new_dou,
            time
        }, { transaction });
        // 
        return {
            _user_new_dou
        }
    });
    // 
    if(!_re || _re==1)
    {
        return {
            M:{c:'月工资领取失败，请稍后再试！'},
            UserYgzLoading:''
        }
    }
    // 
    return {
        M:{c:'领取完成，金豆已到账！'}, 
        Auth:{dou:_re._user_new_dou},
        UserYgzReload: dayjs().valueOf()
    }
}
// 
module.exports = {
    ygz_go,
    go
}