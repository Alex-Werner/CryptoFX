var Globals = require('./globals.js');
global['reqRoot']=Globals.reqRoot;
global['cl']=Globals.cl;

var moment = require('moment');
var requestify = require('requestify');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('lodash');

var API = reqRoot('API/api.js');
var MIB = reqRoot('MIB/mib.js');

var addTicker=function(pair){
        var pair = pair;
        var getTicker = await(API.bittrex.publicAPI.getTicker(pair));
    
        MIB.populate('ticker',{
            pair:pair,
            exchange:"bittrex",
            last:getTicker.result.Last,
            bid:getTicker.result.Bid,
            ask:getTicker.result.Ask
        });
};
var startFillDatabaseLoop = function(arrayOfPairToFill){
    setInterval(function () {
        return async(function(){
            _.each(arrayOfPairToFill, function(pair){
                addTicker(pair);
                cl(MIB.getLastPrice('bittrex', pair,true));
            });
        })();
    },60*1000);
};
    return async(function () {
        var marketSum = await(API.bittrex.publicAPI.getMarketSummaries()).result;
        var topTenMarket = marketSum.sort(function(a,b){
            return b.BaseVolume - a.BaseVolume;
        }).slice(0,10);
        cl("We found the top 10 markets on bittrex and here they are");
        var arrayOfPairToFill = [];
        _.each(topTenMarket, function(market){
            cl(market.MarketName, "with", market.BaseVolume, "btc");
            arrayOfPairToFill.push(market.MarketName);
        });
        startFillDatabaseLoop(arrayOfPairToFill)
    })();    

    
    
    
    // cl("getTicker",getTicker.result)
    
    // cl(await(API.bittrex.publicApi.getTicker('btc-eth')));
    
