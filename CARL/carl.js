var Globals = require('../globals.js');
global['reqRoot'] = Globals.reqRoot;
global['cl'] = Globals.cl;

var reconnectDefaultInterval = 1 * 1000;
var reconnectFailedInterval = 10 * 1000;
var reconnectAttempt = 0;

var connectMIB = function () {
    var MIBSocket = new require('ws')('ws://localhost:10001');
    cl('Trying to connect...');
    MIBSocket.on('open',function open(){
        cl('Connection successful');
        reconnectAttempt=0;
        MIBSocket.on('message',function incoming(message){
            cl(message);
        });
        
        var interval = setInterval(function(){
            if(MIBSocket.readyState == MIBSocket.CLOSED){
                cl('Tring to reconnect');
                clearInterval(interval);
                // cl(connect());
            }
            else if(MIBSocket.readyState == MIBSocket.OPEN){
                //Send JSON
                MIBSocket.send(JSON.stringify(
                    {
                        "type":"ticker",
                        "data":{
                            "pair":"btc-dgb",
                            "exchange":"bittrex",
                            "ask":0.00000059,
                            "bid":0.00000058,
                            "last":0.00000059
                        }
                    }
                ));
                MIBSocket.send(JSON.stringify(
                    {
                        "type":"MIBData",
                        "data":{
                            "action":"getLastPrice",
                            "exchange":"bittrex",
                            "pair":"btc-dgb"
                        }
                    }
                ));
                //Send string
                // MIBSocket.send("ping");
            }
        },1*1000)//From first analysis, we don't handle more than a tick per 50ms
    });
    MIBSocket.on('close',function(e){
        var reconnectInterval = (reconnectAttempt==0)? reconnectDefaultInterval:(reconnectAttempt*reconnectFailedInterval);
        cl('The connection has been closed, we will try to reconnect in',reconnectInterval/1000,"s\n");
    
        setTimeout(connectMIB, reconnectInterval);
        reconnectAttempt++;
    });
    MIBSocket.on('error',function(e){
        cl('An error occured while connecting... '+e);
    });
};
connectMIB();
