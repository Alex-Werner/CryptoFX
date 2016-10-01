var Globals = require('../globals.js');
var seneca = require('seneca')();
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('lodash');
var moment = require('moment');
var Later = require('later');

global['reqRoot'] = Globals.reqRoot;
global['cl'] = Globals.cl;
global['ce'] = Globals.ce;

var API = reqRoot('../API/api.js');
var MIBConnect = seneca.client({
    type: 'http',
    port: 12121,
    host: 'localhost',
});
var config = {
    startingNow: true,
    waitForPlain: "minute",//hour or minute
    fetchIntervalTimeSeconds: 60,
    markets: {
        poloniex: {
            fetchTop: 3,//set to false to deactivate
            fetchIntervalTimeSeconds: 30
        }
    }
};
var fillerInterval;

var getBittrexTopMarket = function (numberToGet) {
    return async(function () {
        var market = await(API.bittrex.publicAPI.getMarketSummaries()).result;
        market = market.sort(function (a, b) {
            return b.BaseVolume - a.BaseVolume;
        }).slice(0, 1);
        return market;
    })();
    
};
var startBittrexFetch = function () {
    var topMarkets = await(getBittrexTopMarket(1));
    cl("We found the top 1 markets on bittrex and here they are");
    var arrayOfPairToFill = [];
    _.each(topMarkets, function (market) {
        cl(market.MarketName, "with", market.BaseVolume, "btc");
        if (market.BaseVolume) {
            arrayOfPairToFill.push(market.MarketName)
        }
    });
    cl('----- Starting Bittrex \n');
    /* Fetch BITTREX */
    if (arrayOfPairToFill && Array.isArray(arrayOfPairToFill) && (arrayOfPairToFill.length) >= 1 && (arrayOfPairToFill).indexOf(undefined) == -1) {
        var arrOfPromises = [];
        cl('Init promises');
        _.each(arrayOfPairToFill, function (pair) {
            var promise = API.bittrex.publicAPI.getTicker(pair);
            arrOfPromises.push([pair, promise]);
        });
        var executeFetchBittrex = function () {
            cl("Executed fetch at ", moment().format('YYYY-MM-DD HH:mm:ss'));
            _.each(arrOfPromises, function (arr) {
                var pair = arr[0];
                var promise = arr[1];
                
                
                promise.then(function (response) {
                    if (response.success) {
                        var result = response.result;
                        if (pair && result && result.Ask && result.Bid && result.Last) {
                            cl(response)
                            MIBConnect.act({
                                role: 'MIB',
                                store: 'ticker',
                                pair: pair,
                                exchange: 'bittrex',
                                ask: result.Ask,
                                bid: result.Bid,
                                last: result.Last
                            }, function (err, result) {
                                if (err) return console.error(err);
                                result.now = moment().format('YYYY-MM-DD HH:mm:ss');
                                // result.pair = pair;
                                // console.log("res:", result);
                            })
                        }
                    }
                })
            });
        };
        
        //We want to start at an exact time so we could use Later for that (for now we won't)
        //We want a localTime (hello yourself)
        // Later.date.localTime();// Later.setInterval(executeFetchBittrex, scheduleParsed);
        
        var _m = moment();
        var ts = _m.valueOf();
        var startAt = ts;
        if (!config.startingNow) {
            if (config.waitForPlain == "hour") {
                startAt = moment().add(1, 'hour').startOf('hour').valueOf();
            }
            if (config.waitForPlain == "minute") {
                startAt = moment().add(1, 'minutes').startOf('minutes').valueOf();
            }
        }
        var diff = startAt - ts;//Number of milliseconds before a start
        if (config.startingNow) {
            diff = 0;
        }
        cl("Will start at", moment(startAt).format('YYYY-MM-DD HH:mm:ss'), "in", (diff / 1000), "sec");
        
        //Will execute that at the first next plain hours
        //Then it will execute it every fetchIntervalTimeSeconds
        setTimeout(function () {
            cl('First exec done at ', moment().format('YYYY-MM-DD HH:mm:ss'));
            executeFetchBittrex();
            cl('Next exec at ', moment().add(config.fetchIntervalTimeSeconds / 1000, 'second').format('YYYY-MM-DD HH:mm:ss'));
            fillerInterval = setInterval(executeFetchBittrex, config.fetchIntervalTimeSeconds * 1000);
        }, diff);
    } else {
        cl("\n[ERROR]: We've got wrong array");
        var debug = {
            isSomething: !!arrayOfPairToFill,
            isArray: Array.isArray(arrayOfPairToFill),
            isAtleastOne: (arrayOfPairToFill.length) >= 1,
            isNotUndefined: (arrayOfPairToFill).indexOf(undefined) == -1
        };
        cl(debug);
    }
}

/* Helpers */
var startWaitForPlainLoop = function (startingNow, waitForType, fetchTimeInterval, callback) {
    if (!startingNow || !waitForType || !callback) {
        ce('Sorry, CB, Type or startingNow missing');
    }
    var _m = moment();
    var ts = _m.valueOf();
    var startAt = ts;
    if (!startingNow) {
        if (waitForType == "hour") {
            startAt = moment().add(1, 'hour').startOf('hour').valueOf();
        }
        if (waitForType == "minute") {
            startAt = moment().add(1, 'minutes').startOf('minutes').valueOf();
        }
    }
    var diff = startAt - ts;//Number of milliseconds before a start
    if (startingNow) {
        diff = 0;
    }
    cl("Will start at", moment(startAt).format('YYYY-MM-DD HH:mm:ss'), "in", (diff / 1000), "sec");
    //Will execute that at the first next plain hours
    //Then it will execute it every fetchIntervalTimeSeconds
    setTimeout(function () {
        cl('First exec done at ', moment().format('YYYY-MM-DD HH:mm:ss'));
        callback();
        cl('Next exec at ', moment().add(config.fetchTimeInterval / 1000, 'second').format('YYYY-MM-DD HH:mm:ss'));
        fillerInterval = setInterval(callback, fetchTimeInterval * 1000);
    }, diff);
};
var perform = function (command, values) {
    var allowedCommands = ["storeTicker"];
    if (allowedCommands.indexOf(command) > -1) {
        switch (command) {
            case "storeTicker":
                if (!!values && !!values.ask && !!values.bid && !!values.last && !!values.pair && !!values.exchange) {
                    MIBConnect.act({
                        role: 'MIB',
                        store: 'ticker',
                        pair: values.pair,
                        exchange: values.exchange,
                        ask: values.ask,
                        bid: values.bid,
                        last: values.last
                    }, function (err, result) {
                        if (err) return console.error(err);
                        result.now = moment().format('YYYY-MM-DD HH:mm:ss');
                        return result;
                    });
                } else {
                    var debug = {
                        isSomething: !!values,
                        isAtleastOne: ((Object.keys(values).length) >= 1),
                        hasAsk: !!values.ask,
                        hasBid: !!values.bid,
                        hasLast: !!values.last,
                        hasPair: !!values.pair,
                        hasExchange: !!values.exchange
                    };
                    ce('Missing values');
                    cl(debug);
                    return false;
                }
                break;
        }
        return true;
    } else {
        ce('Unable to perform action', command);
        return false;
    }
};
var performAsync = function (commands, values) {
    return new Promise(function (resolve, reject) {
        var result = perform(commands, values);
        return resolve(result);
    })
};
var getTopVolume = function (object, topNumber) {
    var topVolume = [];
    for (var i = 0; i < topNumber; i++) {
        topVolume.push(0);
    }
    for (var marketName in object) {
        for (var i = 0; i < topNumber; i++) {
            if (topVolume[i] < Number(object[marketName].baseVolume)) {
                topVolume[i] = Number(object[marketName].baseVolume);
                break;
            }
        }
    }
    
    var result = {};
    for (var i = 0; i < topVolume.length; i++) {
        var vol = topVolume[i];
        for (var marketName in object) {
            if (Number(object[marketName].baseVolume) == vol) {
                result[marketName] = object[marketName];
            }
        }
    }
    return result;
};
/* Fetchers */
var startPoloniexFetch = function () {
    var getAllTicks = function () {
        return API.poloniex.getTickers();
    };
    var executeFetchPoloniex = function () {
        cl("Executed fetch at ", moment().format('YYYY-MM-DD HH:mm:ss'));
        getAllTicks()
            .then(function (response) {
                var result = JSON.parse(response);
                
                if (config.markets.poloniex.fetchTop) {
                    if (config.markets.poloniex.fetchTop == true) {
                        config.markets.poloniex.fetchTop = 10;
                    }
                    result = getTopVolume(result, config.markets.poloniex.fetchTop);
                }
                
                var start = (process.hrtime()[0] * 1e3) + (process.hrtime()[1] / 1e6);
                
                var rLength = Object.keys(result).length;
                var promises = [];
                _.each(result, function (val, indexName) {
                    var tick = {
                        lowestAsk: val.lowestAsk,
                        highestBid: val.highestBid,
                        last: val.last,
                        pair: indexName,
                        id: val.id,
                        percentChange: val.percentChange,
                        baseVolume: val.baseVolume,
                        quoteVolume: val.quoteVolume,
                        isFrozen: val.isFrozen,
                        high24hr: val.high24hr,
                        low24hr: val.low24hr,
                        exchange: "poloniex"
                    };
                    if (tick.isFrozen == 0) {
                        var promise = performAsync('storeTicker', {
                            ask: tick.lowestAsk,
                            bid: tick.highestBid,
                            last: tick.last,
                            pair: tick.pair,
                            exchange: tick.exchange
                        });
                        
                        promises.push(promise);                        
                    } else {
                        ce(tick.pair, "is frozen");
                    }
                });
                Promise
                    .all(promises.map(function (promise) {
                        return promise.reflect();
                    }))
                    .each(function (inspection) {
                        if (inspection.isFulfilled()) {
                            // console.log("A promise in the array was fulfilled with", inspection.value());
                        } else {
                            console.error("A promise in the array was rejected with", inspection.reason());
                        }
                    })
                    .finally(function () {
                        // cl('Fetched', promises.length,'in', (process.hrtime()[0] * 1e3) + (process.hrtime()[1] / 1e6) - start, "ms");
                    });
            });
    };
    
    startWaitForPlainLoop(
        config.startingNow,
        config.waitForPlain,
        config.markets.poloniex.fetchIntervalTimeSeconds,
        executeFetchPoloniex
    );
};

MIBConnect.ready(function () {
    cl("[FETCHER] Connected to MIB \n");
    cl("Config is ", config, '\n');
    var startFetching = function () {
        return async(function () {
            
            cl('Init fetching...');
            // startBittrexFetch();
            
            startPoloniexFetch();
            
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
        if (err) {
            cl(err);
        }
        else {
            cl('close complete!');
        }
        process.exit(0);
    });
    cl('Received SIGINT.  Press Control-C again to exit.');
});