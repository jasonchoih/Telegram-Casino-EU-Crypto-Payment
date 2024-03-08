const bcrypt = require('bcryptjs');
// 
// 密码
const xPass = async(pass) => {
    return bcrypt.hashSync(pass, bcrypt.genSaltSync(10));
};
//
module.exports = {
    xPass
};