var Globals = require('../globals.js');
var seneca = require('seneca')();
var MAB = require('./mab.js');
var moment = require('moment');

global['reqRoot'] = Globals.reqRoot;
global['cl'] = Globals.cl;

var MIBConnect = seneca.client({
    type: 'http',
    port: 12121,
    host: 'localhost'
});
var fetcherInterval;

var executeFetchListAll = function(){
    MIBConnect.act({
        role:"MIB",
        get:"listAll"
    },function(err, result){
        if(err) return console.error(err);
        if(!Object.keys(result.list).length){
            //We didn't got it, let's retry in 60s
            setInterval(executeFetchListAll,60*1000);
        }else{
            //We got it ! 
        }
        // cl(result);
    })
};
var getDatabase = function(){
    MIBConnect.act({
        role:"MIB",
        get:'database'
    },function(err, result){
        if(err) return console.error(err);
        // cl(result.database.poloniex.markets['BTC_XMR']);
            MAB.initDatabaseFromList(result.database);
            MAB.performCalculation();        
            
            // cl(MAB.database['poloniex'].markets['BTC_XMR']);
            // cl(MAB.database['poloniex'].markets['BTC_XMR'].history['1m']);
            // cl(MAB.database['poloniex'].markets['BTC_XMR'].history['5m']);
    
        // console.log(result.database['bittrex'].markets);
    })
};

MIBConnect.ready(function () {
    cl("[MAB] Connected to MIB");
    executeFetchListAll();
    getDatabase();
});
process.on('SIGINT', () => {
    clearInterval(fetcherInterval);
    seneca.close((err) => {
        if (err) cl(err);
        else cl('close complete!')
    });
    cl('Received SIGINT.  Press Control-C again to exit.');
});
