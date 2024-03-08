const shortid = require('js-shortid');
const { createCipheriv, createDecipheriv, createHash } = require("crypto");
const bcrypt = require('bcryptjs');
//
const _bkey = 'D2ApxLk9G3PAsJrM';
const _ckey = 'F3JL7ED6jqWjcrY9';
const _key = Buffer.from(_bkey, 'utf8');
const _iv = Buffer.from(_ckey, 'utf8');
//
const enSign = async(src) => {
    let sign = '';
    const cipher = createCipheriv('aes-128-cbc', _key, _iv);
    sign += cipher.update(src, 'utf8', 'hex');
    sign += cipher.final('hex');
    return sign;
};
// 
const deSign = async(sign) => {
    let src = '';
    const cipher = createDecipheriv('aes-128-cbc', _key, _iv);
    src += cipher.update(sign, 'hex', 'utf8');
    src += cipher.final('utf8');
    return src;
};
// 
const md5 = async(s) => {
    return createHash('md5').update(String(s)).digest('hex');
};
//
const UUID = async(salts = 8) => {
    return shortid.gen({
        initTime: Date.now(),
        salts,
        interval: 1
    });
};
//
const xPass = async(p) => {
    return bcrypt.hashSync(p, bcrypt.genSaltSync(10));
};
//
const cPass = async(post_pass, user_pass) => {
    return bcrypt.compareSync(post_pass, user_pass)
}
//
module.exports = {
    enSign,
    deSign,
    md5,
    UUID,
    xPass,
    cPass
};