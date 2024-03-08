//
const dayjs = require('dayjs');
const { ADMINDAYDATA, ADMINSUM } = require('../sequelize/db28');
// 
const zoreCheck = async(d) => 
{
    if(!d) return 0;
    return parseInt(d);
}
// 
const dataCheck = async(d, _d) => 
{
    const _upd = {};
    // 
    const arr = ['sys_charge','admin_charge','agent_charge','exchange'];
    // 
    for(let i in arr)
    {
        const _ai = arr[i];
        if(d[_ai]) _upd[_ai] = parseInt( (await zoreCheck(_d[_ai])) + d[_ai] );
    }
    if(Object.keys(_upd).length<=0) return '';
    return _upd;
}
const dataNew = async(d) => 
{
    const _ind = {};
    // 
    const arr = ['sys_charge','admin_charge','agent_charge','exchange'];
    // 
    for(let i in arr)
    {
        const _ai = arr[i];
        if(d[_ai])
        {
            _ind[_ai] = parseInt( d[_ai] );
        }else{
            _ind[_ai] = 0;
        }
    }
    return _ind;
}
//
const AdminSums = async(d) => 
{
    const { admin_id, transaction } = d;
    // 
    // 
    const time = dayjs().format('YYYY-MM-DD'); 
    // 今日总体数据记录
    const _admin_day = await ADMINDAYDATA.findOne({attributes:['id','sys_charge','admin_charge','agent_charge','exchange'],where:{admin_id,time}}, { transaction });
    if(_admin_day)
    {
        const _upd = await dataCheck(d, _admin_day);
        if(_upd)
        {
            await ADMINDAYDATA.update(_upd, 
            {
                where:{ admin_id, time }
            }, { transaction });
        }
    }else{
        const _ind = await dataNew(d);
        await ADMINDAYDATA.create({
            admin_id,
            ..._ind,
            time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }, { transaction });
    }
    // 总体情况
    const _admin_sum = await ADMINSUM.findOne({attributes:['id','sys_charge','admin_charge','agent_charge','exchange'],where:{admin_id}}, { transaction });
    if(_admin_sum)
    {
        const _upd = await dataCheck(d, _admin_sum);
        if(_upd)
        {
            await ADMINSUM.update(_upd, {
                where:{ admin_id }
            }, { transaction });
        }
    }else{
        const _ind = await dataNew(d);
        await ADMINSUM.create({
            admin_id,
            ..._ind,
            time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }, { transaction });
    }
}
// 
module.exports = 
{
    AdminSums
}