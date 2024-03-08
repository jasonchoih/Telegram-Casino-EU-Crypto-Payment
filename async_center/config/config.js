require('dotenv').config();

// 
module.exports = {
    redis_1_Config: {
        port: 6379,
        host: '127.0.0.1',
        password: '?16ASNx8O}cTJI:v&/?m',
        db: 0,
    },
    // 
    redis_2_Config: {
        port: 6379,
        host: '127.0.0.1',
        password: '?16ASNx8O}cTJI:v&/?m',
        db: 1,
    },
    // PUB SUB to autobots
    redis_3_Config: {
        port: 6379,
        host: '127.0.0.1',
        password: '?16ASNx8O}cTJI:v&/?m',
        db: 2,
    },
    // Auto bot list
    redis_5_Config: { 
        port: 6379,
        host: '127.0.0.1',
        password: '?16ASNx8O}cTJI:v&/?m',
        db: 5,
    },
    // 
    sequelizeDB28: {
        host: 'localhost',
        port: '3306',
        username: 'root',
        password: '5A$l%4$tcAbyv=C$2%/D',
        database: 'telegram_20240219'
    }
}