// 
const { controller } = require('./app/plugin/controllers');
const con = controller('../controller');
// 
const { wsss } = require('./app/plugin/wss');
//
const ports = [
    9202,
    // 9203,
    // 9204,
];
for(let i in ports)
{
  wsss(ports[i], con); 
}

