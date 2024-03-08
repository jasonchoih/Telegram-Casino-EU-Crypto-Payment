//
const request = require('request-promise');
const { get_1, get_1_List } = require('../plugin/redis');
//
const get_game_lottery_list_check = async(d) =>
{
    const { category } = d;
    //
    const rows = await get_1_List(category);
    //
    let _re = [];
    const uri = 'http://54.86.1.51:3692';
    try {
        _re = await request({
            method: 'get',
            json: true,
            uri,
            timeout: 5000
        });
    } catch (error) {

    }
    //
    if(!_re) return '';
    //
    let _r = [];
    for(let i in _re)
    {
        if(rows.find(v=>v.peroids==i))
        {
            _r.push(_re[i])
        }
    }
    let _n = [];
    for(let i in rows)
    {
        // console.log(rows[i]['number']);
        if(rows[i]['peroids']=='2795582')
        {
            console.log(JSON.stringify(rows[i]));
            // _n.push(rows[i])
        }
    }
    // console.log(rows.length, _re.length, _r, _n);
    //
    return _r;
}
//
module.exports = {
    get_game_lottery_list_check
};