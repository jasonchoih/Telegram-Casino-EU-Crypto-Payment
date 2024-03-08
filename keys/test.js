const dayjs = require('dayjs');
const { get_2 } = require('./plugin/redis');
// 
const oddCheck = async(data, ls) => 
{
    let _d = [ ...data, { ls, odd:'-' } ]; // 组合
    _d.sort( (a, b) => { return parseFloat(a.ls) - parseFloat(b.ls) }); // 排序
    const _i = _d.findIndex(v=>v.odd=='-'); // 取位
    const _ii = _i-1; // 位置
    if(_ii==-1) return { ls:data[0]['ls'],odd:'0' };
    return _d[_ii];
}
// 
const test = async() =>
{
    const { start_time, end_time, name, data } = await get_2('HdflDl');
    // 
    const _start = dayjs(start_time).diff(dayjs(),'second');
    const _end = dayjs(end_time).diff(dayjs(),'second');
    // 类型 1首充返利 2投注返利 3亏损返利 4推广返利 

    if(_start<0 && _end>=0){
        console.log({
            _start,
            _end
        })

    }
    // if(!dayjs(start_time).diff(dayjs(),'second')>0 || !dayjs(end_time).diff(dayjs(),'second')<=0) {
    //     console.log('13')
    // }
    
    // if(_start>0) {
    //     console.log ('start> 0')
    //     return
    // }
    // //
    
    // if(_end<=0) {
    //     console.log('end < 0')
    //     return;
    // }
    // 
    // 7000 , bonus
    const { ls, odd } = await oddCheck(data, 7000)
    // console.log({ls, odd})
    // 
    // const lss = await getYgzMonthData(user_id, prev_month);
    // 检查 上月 是否已领取，记录在本月份第一天
    // const userdaydata = await USERDAYDATA.findOne({attributes:['ygz'],where:{user_id,time: this_month}});
    // 
    // if(userdaydata && userdaydata.ygz==2) return 0;
    // 
    // const _d = await oddCheck(_gz.data, lss);
    // if(!_d || !_d.odd || _d.odd=='0') return 0;
    // return _d.odd;
}
test()