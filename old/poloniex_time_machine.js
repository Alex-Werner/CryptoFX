/* Try to get past data from poloniex */

//Period in seconds are  valid  when equals to 300 (5m), 900 (15m), 1800(30), 7200(2h), 14400 (4h), and 86400 (24h)

//Will get all since 19 07 2014
var urlTest = "https://poloniex.com/public/?command=returnChartData&currencyPair=BTC_XMR&start=1405699200&end=9999999999&period=300";

/* Here is how we want to end up processing data : 
 * First we will get all markets we need
 * Then we will do a global fetch 1 years day (86400) history
 * We will select the most interesting one (Should be using volume, but also % of the price moves daily)...
 * For this most interesting stuff we will get all data we need (if we can do more leaning algorithm, we should get as many as X years at 30mn)
 * Then we will proceed to the second market and so go on
 * 
 * Alternative : We could grasp only the previous month on the primary market
 * and then alternate each chunk on markets in a 1-2 month interval ?
 *     
 */


/* For dev purposes : 
 *
 * 1) Specific market : 
 * 2) Get the last 1 hours (5m history)
 * 3) last 1hr (15m, 30m) and compare
 * 
 */

var API = require('./API/api.js');
var cl = console.log;
var moment = require('moment');
var Promise = require('bluebird');

var promiseHistory = API.poloniex.getHistoricData("BTC_XMR",moment().subtract('1','hour').unix(), moment().unix(),1800);
var promiseTick = API.poloniex.getTickers();
/*
 * Poloniex response is an array of tick 
 * {
 *      data : unixData,
 *      high: Float price
 *      low : Float Price
 *      open : Tick opened price
 *      close : Tick close price
 *      volume : Volume of BTC if curr is BTC_XMR
 *      quoteVolume : Volume of XMR if curr is BTC_XMR
 *      weightedAverage : Look more into this
 */
promiseHistory.then(function(data){
    var tickArray = data.body;
    var marketName = data.params.currencyPair;
    
    // for(var i=0; i<tickArray.length; i++){
    for(var i=0; i<1; i++){
        var tick = tickArray[i];
        cl(tick);
        cl('\n');
        
        var lastObj = {
            price: tick.close,
            timestamp: tick.date
        };
        
        var marketNameSplitted = marketName.split('_');
        var BTCVol = (marketNameSplitted[0]=="BTC") ? tick.volume : tick.quoteVolume;
    
        var historyObj = {
            last: tick.close,
            close: tick.close,
            open: tick.open,
            timestamp: tick.date,
            BTCVol:BTCVol
        };
        cl(lastObj, historyObj);
        cl("\n");
        // var marketNameSplitted = marketName.split('_');
        // var BTCVol = (marketNameSplitted[0]=="BTC") ? tick.baseVolume : tick.quoteVolume;
    
    
        // cl(tickArray[i]);
    }
    
    // var promise = performAsync('storeTicker', {
    //     ask: tick.lowestAsk,
    //     bid: tick.highestBid,
    //     last: tick.last,
    //     pair: tick.pair,
    //     BTCVol:val.BTCVol,
    //     exchange: tick.exchange
    // });
    
});
/*
 * Poloniex response in an object of object
 * {
 *      id : We don't care
 *      last : last price
 *      lowestAsk : Lowest ask price
 *      highestBid : Highest bid price
 *      percentChange :Percent change of the last tick ? ( TODO  verify if statement is true!)
 *      baseVolume :  Volume of BTC if curr is BTC_XMR
 *      quoteVolume : Volume of XMR if curr is BTC_XMR
 *      isFrozen : Bool number
 *      high24hr : Last 24hr high
 *      low24hr : last 24hr low
 *      
 * }
 * 
 */
promiseTick.then(function(data){
    var tickObj = data.body;
    var marketName = "BTC_XMR";
    var tick = tickObj[marketName];
    
    var now = moment().unix();
    var lastObj = {
        price: tick.last,
        timestamp: now
    };
    
    var marketNameSplitted = marketName.split('_');
    var BTCVol = (marketNameSplitted[0]=="BTC") ? tick.baseVolume : tick.quoteVolume;
    
    var historyObj = {
        last: tick.last,
        bid: tick.highestBid,
        ask: tick.lowestAsk,
        timestamp: now,
        BTCVol:BTCVol
    };
    
    console.log(tick);
    
    cl(lastObj, historyObj);
});

/* 
* 
* 
* Larger scale : 
* 
* 
* 2) Get the last 30 days dailyhistory
* 3) Get the last 15 days 4hr history
*/