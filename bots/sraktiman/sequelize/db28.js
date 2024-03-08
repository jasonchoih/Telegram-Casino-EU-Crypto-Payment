//
const fs = require('fs');
const path = require('path');
// 
const { sequelizeDB28 } = require('../config/config');
const { Sequelize, DataTypes, QueryTypes, Transaction, Op } = require("sequelize");
// 
// console.log(sequelizeDB28);
const sequelize = new Sequelize(sequelizeDB28.database, sequelizeDB28.username, sequelizeDB28.password, {
    host: sequelizeDB28.host,
    dialect: 'mariadb',
    logging: null, 
    timezone: '+08:00',
    //
    define: {
        underscored: true,
        timestamps: false,
        freezeTableName: true
    }
});
// 
// sequelize.sync({})
// 
let _path = './modals_db28';
let exp = {};
const files = fs.readdirSync(path.join(__dirname, _path));
for (let i in files) {
    const fileName = files[i].replace(/\.js/i, '');
    const parameter = require(_path + '/' + fileName)(DataTypes);
    const file = fileName.replace(/\_/g, '').toUpperCase();
    exp[file] = sequelize.define(fileName, parameter);
}
// console.log(exp);
module.exports = {...exp, Sequelize, sequelize, QueryTypes, Transaction, Op };