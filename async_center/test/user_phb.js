// 
const dayjs = require('dayjs');
const { Op, USERS, USERDATA, USERPHB, USERDAYDATA, USERLOGDOU } = require('../sequelize/db28');
// 
const test = async() =>
{
    const user_id = 892557;
    const time_start = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const time_end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    // console.log(time_start, time_end);
    const _yser_day_data = await USERPHB.findOne({
        where:
        {
            user_id, 
            time:{
                [Op.gte]: time_start,
                [Op.lte]: time_end,
            }
        }
    })
    // {
    //     where['vals'] = 
    //     {
    //         [Op.like]: today+'%'
    //     };
    // }
    // console.log(_yser_day_data);
}
test();



// where: {
//     title: {
//       [Op.like]: 'foo%'
//     }
//   },