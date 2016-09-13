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

var handleMIBData = function(parsed, ws){
    var data = parsed.message.data;
    var missingParams = false;
    if(!data.hasOwnProperty('action')){
        missingParams = true;
        ws.send('Missing action');
    }
    if(!data.hasOwnProperty('exchange')){
        missingParams=true;
        ws.send('Missing exchange');
    }
    if(!data.hasOwnProperty('pair')){
        missingParams=true;
        ws.send('Missing pair');
    }
    if(!missingParams){
        // cl('ticker', data);
        var lastPrice = MIB.getLastPrice(data.exchange, data.pair, true);
        cl(lastPrice);
    }
    
};
var handleTicker = function(parsed, ws){
    var data = parsed.message.data;
    var missingParams = false;
    if(!data.hasOwnProperty('exchange')){
        missingParams=true;
        ws.send('Missing exchange');
    }
    if(!data.hasOwnProperty('pair')){
        missingParams=true;
        ws.send('Missing pair');
    }
    if(!data.hasOwnProperty('last')){
        missingParams=true;
        ws.send('Missing last');
    }
    if(!data.hasOwnProperty('bid')){
        missingParams=true;
        ws.send('Missing bid');
    }
    if(!data.hasOwnProperty('ask')){
        missingParams=true;
        ws.send('Missing ask');
    }
    if(!missingParams){
        // cl('ticker', data);
        MIB.populate('ticker',{
            pair:data.pair,
            exchange:data.exchange,
            last:data.last,
            bid:data.bid,
            ask:data.ask
        });
        cl("MIB DB IS", MIB.getDatabaseSize())
    }
};

MIBServerSocket.on('connection', function connection(ws) {
    CLIENTS.push(ws);
    var clientID = CLIENTS.length-1;
    cl('New client connected, id',clientID);
    cl('Other clients:');
    for (var i=0; i<CLIENTS.length; i++) {
        cl("ID:",i," Connected:",CLIENTS[i].readyState==ws.OPEN);
    }
    cl('\n');
    
    ws.on('message', function incoming(message) {
        // cl('Got by client ', clientID);
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
                        case "MIBData":
                            handleMIBData(parsed, ws);
                            break;
                        case "ticker":
                            handleTicker(parsed, ws);
                            break;
                    }
                    
                }
                break;
        }
        
        
        // cl("received",parsed.type,":",parsed.message);
    });
    ws.send('\n You are connected to : MIB');
});
