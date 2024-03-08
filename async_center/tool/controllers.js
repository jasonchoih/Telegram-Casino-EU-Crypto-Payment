//
const fs = require('fs');
const path = require('path');
// 
const controllers = (_path) => 
{
    let cons = {};
    const files = fs.readdirSync(path.join(__dirname, _path));
    for(let i in files)
    {
        cons[files[i]] = {};
        const file_list = fs.readdirSync(path.join(__dirname, _path+'/'+files[i]));
        for(let j in file_list)
        {
            let fileName = file_list[j].replace(/\.js/i, '');
            cons[files[i]][fileName] = require(_path+'/'+files[i]+'/'+fileName);
        }
    }
    return cons;
}
// 
module.exports = controllers;