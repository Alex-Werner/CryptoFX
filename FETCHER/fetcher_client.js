var Globals = require('../globals.js')
var seneca = require('seneca')();
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('lodash');
var moment = require('moment');
var Later = require('later');

global['reqRoot'] = Globals.reqRoot;
global['cl'] = Globals.cl;

var API = reqRoot('../API/api.js');
seneca.client({
    type: 'http',
    port: 12121,
    host: 'localhost',
});
var config = {
    startingNow:false,
    waitForPlain:"minute",//hour or minute
    fetchIntervalTimeSeconds:60
};
var fillerInterval;
seneca.ready(function () {
    console.log("FETCHER CLIENT LOADED \n");
    console.log("Config is ", config,'\n');
    var startFetching = function () {
        return async(function () {
            var marketSum = await(API.bittrex.publicAPI.getMarketSummaries()).result;
            var topTenMarket = marketSum.sort(function (a, b) {
                return b.BaseVolume - a.BaseVolume;
            }).slice(0, 10);
            cl("We found the top 10 markets on bittrex and here they are");
            var arrayOfPairToFill = [];
            _.each(topTenMarket, function (market) {
                cl(market.MarketName, "with", market.BaseVolume, "btc");
                if (market.BaseVolume) {
                    arrayOfPairToFill.push(market.MarketName)
                }
                ;
            });
            cl('----- Starting \n');
            /* Fetch BITTREX */
            if(arrayOfPairToFill && Array.isArray(arrayOfPairToFill) && (arrayOfPairToFill.length==10) && (arrayOfPairToFill).indexOf(undefined)==-1) {
                var arrOfPromises = [];
                cl('Init promises');
                _.each(arrayOfPairToFill, function(pair){
                    var promise = API.bittrex.publicAPI.getTicker(pair);
                    arrOfPromises.push([pair,promise]);
                });
                var executeFetchBittrex = function(){
                    cl("Execute fetch at ", moment().format('YYYY-MM-DD HH:mm:ss'));
                    _.each(arrOfPromises, function (arr) {
                        var pair = arr[0];
                        var promise = arr[1];
                        promise.then(function (response) {
                            if (response.success) {
                                var result = response.result;
                                seneca.act({
                                    role: 'MIB',
                                    store: 'ticker',
                                    pair: pair,
                                    exchange: 'bittrex',
                                    ask: result.Ask,
                                    bid: result.Bid,
                                    last: result.Last
                                }, function (err, result) {
                                    if (err) return console.error(err);
                                    // result.now = moment().format('YYYY-MM-DD HH:mm:ss');
                                    // result.pair = pair;
                                    // console.log("res:", result);
                                })
                            }
                        })
                    });
                };
                
                //We want to start at an exact time so we could use Later for that (for now we won't)
                //We want a localTime (hello yourself)
                // Later.date.localTime();// Later.setInterval(executeFetchBittrex, scheduleParsed);
                
                var _m = moment();var ts = _m.valueOf();
                var startAt = ts;
                if(!config.startingNow){
                    if(config.waitForPlain=="hour"){
                        startAt = moment().add(1, 'hour').startOf('hour').valueOf();
                    }
                    if(config.waitForPlain=="minute"){
                        startAt = moment().add(1, 'minutes').startOf('minutes').valueOf();
                    }
                }
                var diff = startAt-ts;//Number of milliseconds before a start
                if(config.startingNow){
                    diff=0;
                }
                cl("Will start at",moment(startAt).format('YYYY-MM-DD HH:mm:ss'), "in", (diff/1000),"sec");
                
                //Will execute that at the first next plain hours
                //Then it will execute it every fetchIntervalTimeSeconds
                setTimeout(function(){
                    cl('First exec done at ', moment().format('YYYY-MM-DD HH:mm:ss'));
                    executeFetchBittrex();
                    cl('Next exec at ', moment().add(config.fetchIntervalTimeSeconds/1000,'second').format('YYYY-MM-DD HH:mm:ss'));
                    fillerInterval=setInterval(executeFetchBittrex, config.fetchIntervalTimeSeconds*1000);
                },diff);
            }else{
                cl("\n[ERROR]: We've got wrong array");
                var debug = {
                    isSomething : !!arrayOfPairToFill,
                    isArray: Array.isArray(arrayOfPairToFill),
                    isTen: (arrayOfPairToFill.length==10),
                    isNotUndefined: (arrayOfPairToFill.length==10)
                };
                cl(debug);
            }
            // _.each(arrayOfPairToFill, function (pair) {
            //     var getTicker = await(API.bittrex.publicAPI.getTicker(pair)).result;
            //     if (getTicker) {
            //         fillerInterval = setInterval(function () {
            //             seneca.act({
            //                 role: 'MIB',
            //                 get: 'lastPrice',
            //                 pair: pair,
            //                 exchange: 'bittrex'
            //             }, function (err, result) {
            //                 if (err) return console.error(err);
            //                 console.log("res:", result);
            //             });
            //         }, 1 * 1000);
            //     }
            // });
        })();
    };
    startFetching();
    
    
});
process.on('SIGINT', () => {
    clearInterval(fillerInterval);
    seneca.close((err) => {
        if (err) console.log(err)
        else console.log('close complete!')
        process.exit(0);
    });
    console.log('Received SIGINT.  Press Control-D to exit.');
});