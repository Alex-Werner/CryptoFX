var Globals = require('./globals.js');
global['reqRoot']=Globals.reqRoot;
global['cl']=Globals.cl;

var moment = require('moment');
var requestify = require('requestify');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var API = reqRoot('API/api.js');
var MIB = reqRoot('MIB/mib.js');

var addTicker=function(){
    // return async(function(){
        var pair = "btc-eth";
        var getTicker = await(API.bittrex.publicAPI.getTicker(pair));
    
        MIB.populate('ticker',{
            pair:pair,
            exchange:"bittrex",
            last:getTicker.result.Last,
            bid:getTicker.result.Bid,
            ask:getTicker.result.Ask
        });
    // })();
};

    
    
    setInterval(function () {
        return async(function(){

        addTicker();
        cl(MIB.getLastPrice('bittrex', 'btc-eth',true));
        // addTicker();
        // cl(MIB.getLastPrice('bittrex', 'btc-eth',true));
        })();
    
    },60*1000);
    
    // cl("getTicker",getTicker.result)
    
    // cl(await(API.bittrex.publicApi.getTicker('btc-eth')));
    
