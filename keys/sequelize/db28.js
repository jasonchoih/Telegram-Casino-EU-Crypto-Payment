//
const fs = require('fs');
const path = require('path');
// 
const { sequelizeDB28 } = require('../config/config');
const { Sequelize, DataTypes, QueryTypes, Transaction, Op } = require("sequelize");
// 
const sequelize = new Sequelize(sequelizeDB28.database, sequelizeDB28.username, sequelizeDB28.password, {
    host: sequelizeDB28.host,
    dialect: 'mariadb',
    logging: null, 
    timezone: '+08:00', //for writing to database
    //
    define: {
        underscored: true,
        timestamps: false,
        freezeTableName: true
    }
});

// const tst = async() =>
// {
//     try {
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// }
// tst();

// sequelize.sync({
//     force:true
// })

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