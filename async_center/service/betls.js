// 
const dayjs = require('dayjs'); 
const { objNumSum } = require('../tool/tool');
// 获取流水
const _jd_gz = {
    10: 7, 
    11: 8, 
    16: 11, 
    22: 15, 
    28: 21, 
    36: 3,
    '28gd': 21, 
    'gj': 7,
    'gyh': 11
}
const _qun_gz = {
    dan: [1,3,5,7,9,11,13,15,17,19,21,23,25,27],
    shuang: [0,2,4,6,8,10,12,14,16,18,20,22,24,26],
    da: [14,15,16,17,18,19,20,21,22,23,24,25,26,27],
    xiao: [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
    dadan: [15,17,19,21,23,25,27],
    xiaodan: [1,3,5,7,9,11,13],
    dashuang: [14,16,18,20,22,24,26],
    xiaoshuang: [0,2,4,6,8,10,12],
    jida: [22,23,24,25,26,27],
    jixiao: [0,1,2,3,4,5]
}
const _bdsbz_gz = [ 'bao', 'dui', 'shun', 'ban', 'za' ];
const _qun_check = async(_new_vals) => 
{
    let _r = {};
    let _bz = 0;
    for(let i in _new_vals)
    {
        if(_bdsbz_gz.find(v=>v==i))
        {
            _bz++;
        }else{
            if(_qun_gz[i])
            {
                for(let j in _qun_gz[i])
                {
                    _r[_qun_gz[i][j]] = 1;
                }
            }else{
                _r[i] = _new_vals[i]; 
            }
        }
    }
    if(_bz>_jd_gz[36]) return 28;
    return Object.keys(_r).length;
}
const _is_ls_check = async(category, type, _new_vals) => 
{
    let _is_ls = 1;
    let _new_num = Object.keys(_new_vals).length;
    let _num = _new_num;
    let _type = type;
    // 群流水
    if(['q214','q28'].find(v=>v==category))
    {
        _num = await _qun_check(_new_vals);
        _type = 28;
    }
    // 经典流水
    _is_ls = _num > _jd_gz[_type] ? 2 : 1;
    //
    return {
        _is_ls,
        _new_num
    }
}
// 
const _ls_dou_check = async(_old_ls, _is_ls, _ls_dou, _old_dou) => 
{
    if(_old_ls==2)
    {
        return 0;
    }
    if(_old_ls==1&&_is_ls==2)
    {
        return -_old_dou;
    }
    if(_old_ls==1&&_is_ls==1)
    {
        return _ls_dou;
    }
    return 0;
}
// 
const _two_obj_sum = async(d) => 
{
    let { category, type, _post_vals, _old_vals, _old_dou, _old_ls } = d;
    _old_vals = JSON.parse(_old_vals);
    //
    let _new_vals = {};
    let _new_dou = 0;
    let _ls_dou = 0;
    // 
    for(let i in _post_vals)
    {
        if(_old_vals[i])
        {
            _new_vals[i] = parseInt(parseInt(_post_vals[i])+parseInt(_old_vals[i]));
            _new_dou+= parseInt(_new_vals[i]);
        }else{
            _new_vals[i] = _post_vals[i];
            _new_dou+= parseInt(_post_vals[i]);
        }
        _ls_dou+= parseInt(_post_vals[i]);
    }
    for(let i in _old_vals)
    {
        if(!_post_vals[i])
        {
            _new_vals[i] = _old_vals[i];
            _new_dou+= parseInt(_old_vals[i]);
        }
    }
    // 
    const { _new_num, _is_ls } = await _is_ls_check(category, type, {..._new_vals});
    // 
    _ls_dou = await _ls_dou_check(_old_ls, _is_ls, _ls_dou, _old_dou);
    // 
    return {
        _new_vals,
        _new_dou,
        _new_num,
        _ls_dou,
        _is_ls
    }
}
// 
const lsre = async(d) => 
{
    let { type } = d;
    // 
    const _d = await _two_obj_sum(d);
    // 
    if(['sc','lh'].find(v=>v==type))
    {
        return {
            ..._d,
            _is_ls: 1
        }
    };
    return {
        ..._d
    }
    //
    // return {
    //     // 流水 +流水 -流水
    //     _ls_dou: '',
    //     // 是否流水 1是 2否
    //     _is_ls: 1,
    //     // 最新投注记录
    //     _new_vals: {},
    //     // 最新投注金豆合计
    //     _new_dou: 0,
    //     // 最新投注注数
    //     _new_num: 0,
    // }
}
// 
module.exports = {
    lsre
}