var Globals = require('../globals.js');
global['reqRoot'] = Globals.reqRoot;
global['cl'] = Globals.cl;

var config = require('../config.json');
var MIBServer = config.MIB;

var MIB = require('./mib.js');


var WebSocketServer = require('ws').Server
    , MIBServerSocket = new WebSocketServer({host: MIBServer.host, port: MIBServer.port});
cl('MIB websocket started on ', MIBServerSocket.options.host + ":" + MIBServerSocket.options.port);

var CLIENTS = [];

MIBServerSocket.on('connection', function connection(ws) {
    CLIENTS.push(ws);
    cl('Someone connected.');
    ws.on('message', function incoming(message) {
        var parsed = {
            type: null,
            message: null
        };
        
        if (message.length >= 1) {
            if (message[0] == '{') {
                parsed.type = "object";
                
                parsed.message = JSON.parse(message);
            } else {
                parsed.type = "string";
                parsed.message = message;
            }
        }
        switch (parsed.type) {
            case "object":
                if (parsed.message.type && parsed.message.data) {
                    switch (parsed.message.type) {
                        case "ticker":
                            var data = parsed.message.data;
                            if(!data.hasOwnProperty('pair')){
                                cl('Missing pair');
                                ws.send('Missing pair');
                                
                            }
                            cl('ticker', data);
                            break;
                    }
                    
                }
                break;
        }
        
        
        // cl("received",parsed.type,":",parsed.message);
    });
    ws.send('\n You are connected to : MIB');
});
