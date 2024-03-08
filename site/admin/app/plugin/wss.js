"use strict";
const dayjs = require('dayjs');
const WebSocket = require("ws");
const http = require('http');
const { upgradeCheck, pathCheck, userCheck } = require('../middleware/ws');
const { arrayToBuffer, strToBuffer } = require('./buffer');
const { redis_2_room_sub, redis_2_sub } = require('../plugin/redis');
const wssub = require('./wssub');
//
// -------------------------------------------------------------------------------------------

// 数据发送
const wsSend = async(ws, d) => {
    if (!d) return;
    d = await arrayToBuffer(d, ws.userInfo.ikey);
    if (d) ws.send(d);
};
// -------------------------------------------------------------------------------------------
const wsss = (port, controller) => 
{
    const server = http.createServer();
    const wss = new WebSocket.Server({
        noServer: true
    });
    //
    wss.on('connection', (ws, userInfo) => 
    {
        ws.isAlive = true;
        ws.path = '/';
        ws.userInfo = userInfo;
        ws.in_my_room = false;
        // 
        // 接受客服端的ping
        ws.on('pong', () => {
            ws.isAlive = true;
        });
        // 客服端关闭事件
        ws.on('close', () => {

        });
        // 客户端错误事件
        ws.on("error", function(code, reason) {
            
        });
        // 客户端收发信息
        ws.onmessage = async(d) => 
        {
            // console.log(ws);
            // 心跳信息
            if (d.data == 'i') {
                ws.isAlive = true;
                return;
            }
            // 检查路径
            let _data = await pathCheck(d.data, userInfo.ikey);
            if (!_data) {
                await wsSend(ws, { error: 701 });
                return;
            }
            // 
            // console.log(_data);
            // 用户检查
            let _user = await userCheck(userInfo.platform, userInfo.ip, _data.path, _data);
            // console.log(_user);
            if(_user&&_user.M){
                await wsSend(ws, { ..._user });
                return;
            }
            if(_user)
            {
                ws.uuids = _user.id+'-'+_user.uuid;
                ws.uuidkey = userInfo.wkey+'-'+ws.uuids;
                _data['id'] = _user.id;
                _data['uuidkey'] = ws.uuidkey;
                _data['admin_nick'] = _user.admin_nick;
            }
            // 
            ws.wata = _data;
            _data = {
                ..._data,
                ip: userInfo.ip,
                time: dayjs().format('YYYY-MM-DD HH:mm:ss')
            };
            // 
            // 返回信息
            try {
                const _path = _data.path.split('/');
                let res = await controller[_path[0]][_path[1]](_data);
                // console.log(_path,res);
                await wsSend(ws, res);
            } catch (error) {
                console.log(error)
            }
        };
    });
    // 
    const interval = setInterval(() =>
    {
        wss.clients.forEach((ws) =>
        {
            if (ws.isAlive === false)
            {
                // console.log('已断开的链接');
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping('i');
        });
    }, 30000);
    // //
    wss.on('close', () => {
        clearInterval(interval);
    });
    // 站点监听
    redis_2_sub.subscribe('sd28-admin-data');
    redis_2_sub.on("message", (channel, message) =>
    {
        wss.clients.forEach(async(ws) =>
        {
            if (ws.readyState === WebSocket.OPEN) 
            {
                try {
                    let _m = JSON.parse(message);
                    const { controller } = _m;
                    if(controller=='game_qun_auto_bet_show' || controller=='game_lottery_open' || controller=='game_lottery_new') return;
                    // console.log(_m);
                    const d = await strToBuffer(message, ws.userInfo.ikey);
                    if(!d) return; 
                    ws.send(d);
                } catch (error) {
                    
                }
            }
        });
    });
    // 管理员监听
    redis_2_room_sub.subscribe('sd28-admin-room');
    redis_2_room_sub.on("message", (channel, message) =>
    {
        wss.clients.forEach(async(ws) =>
        {
            if (ws.readyState === WebSocket.OPEN) 
            {
                try {
                    let _m = JSON.parse(message);
                    if(_m.uuidkey!==ws.uuidkey) return;
                    _m = await arrayToBuffer(_m.data, ws.userInfo.ikey);
                    if (_m) ws.send(_m);
                } catch (error) {
                    
                }
            }
        })
    });
    // ----------------------------------------------------------
    // 升级
    server.on('upgrade', async(request, socket, head) => 
    {
        // console.log(request, socket, head);
        const _info = await upgradeCheck(request);
        // 检查
        if (_info < 301) {
            socket.destroy();
            socket.end();
            return;
        }
        // 通过
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, _info);
        });
    });
    //
    server.listen(port);
    // console.log(port);
};
//
module.exports = {
    wsss
};