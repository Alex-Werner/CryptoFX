var Globals = require('../globals.js');
global['cl']=Globals.cl;

const async = require('asyncawait/async');
const await = require('asyncawait/await');
Object.entries = require('object.entries');
var _ = require('lodash');

const describe = require('tape');
const API = require('../API/api.js');
const Indicators = require('../helpers/indicators.js');

var testBittrexApi = false;
var testIndicators = true;

describe('Tape should work', (t) => {
    let nothing = true;
    t.equal(nothing, true);
    t.end();
});

if(testBittrexApi){
    
    describe('Bittrex pubApi should answer getMarkets', (t) => {
        return async(function(){
            let getMarkets = await(API.bittrex.publicAPI.getMarkets());
            t.equal(getMarkets.success, true);
            t.end();
        })();
    });
    describe('Bittrex pubApi should answer getCurrencies', (t) => {
        return async(function(){
            let getCurrencies = await(API.bittrex.publicAPI.getCurrencies());
            t.equal(getCurrencies.success, true);
            t.end();
        })();
    });
    describe('Bittrex pubApi should answer getMarketSummaries', (t) => {
        return async(function(){
            let getMarketSummaries = await(API.bittrex.publicAPI.getMarketSummaries());
            t.equal(getMarketSummaries.success, true);
            t.end();
        })();
    });
    describe('Bittrex pubApi should answer getTicker of btc-eth', (t) => {
        return async(function(){
            let pair ="btc-eth";
            let getTicker = await(API.bittrex.publicAPI.getTicker(pair));
            t.equal(getTicker.success, true);
            t.end();
        })();
    });
    describe('Bittrex pubApi should answer getMarketSummary of btc-eth', (t) => {
        return async(function(){
            let pair ="btc-eth";
            let getMarketSummary = await(API.bittrex.publicAPI.getMarketSummary(pair));
            t.equal(getMarketSummary.success, true);
            t.end();
        })();
    });
    describe('Bittrex pubApi should answer getOrderBook of btc-eth on both', (t) => {
        return async(function(){
            let pair ="btc-eth";
            let getOrderBook = await(API.bittrex.publicAPI.getOrderBook(pair, "both"));
            t.equal(getOrderBook.success, true);
            t.end();
        })();
    });
    describe('Bittrex pubApi should answer getMarketHistory of btc-eth on both', (t) => {
        return async(function(){
            let pair ="btc-eth";
            let getMarketHistory = await(API.bittrex.publicAPI.getMarketHistory(pair, "both"));
            t.equal(getMarketHistory.success, true);
            t.end();
        })();
    });
}

if(testIndicators){
    var ticks = require('./ticksEMA.js');
    
    describe('Should calculate EMA with exact period values', (test) => {
        return async(function(){
            var period = 27;
            var tickArr = Object.entries(ticks).slice(0, period);
            cl("Tick arr is ", tickArr.length);
    
            var values = [];
            tickArr.filter(function(tick){
                values.push(tick[1].close);
            });
            
            var options = {
                period:period,
                values:values
            };
            
            var EMA = Indicators.EMA.calculate(options);
            var supposedEMA = 27.29666667;
            
            test.equal(EMA, supposedEMA);
            test.end();
        })();
    });
    describe('Should calculate EMA with higher period values', (test) => {
        return async(function(){
            var period = 27;
            var tickArr = Object.entries(ticks).slice(0, period+1);
            cl("Tick arr is ", tickArr.length);
            var values = [];
            tickArr.filter(function(tick){
                values.push(tick[1].close);
            });
            
            var options = {
                period:period,
                values:values
            };
            var EMA = Indicators.EMA.calculate(options);
            var supposedEMA = 27.33690476;
            test.equal(EMA, supposedEMA);
    
            cl("Tick arr is ", tickArr.length);
            
            var tickArr = Object.entries(ticks).slice(0, period+3);
            var values = [];
            tickArr.filter(function(tick){
                values.push(tick[1].close);
            });
            var options = {
                period:period,
                values:values
            };
            var EMA = Indicators.EMA.calculate(options);
            var supposedEMA = 27.42243319;
            test.equal(EMA, supposedEMA);
    
            test.end();
        })();
    });
}