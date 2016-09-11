var Globals = require('../globals.js');
global['cl']=Globals.cl;

const async = require('asyncawait/async');
const await = require('asyncawait/await');

const describe = require('tape');
const API = require('../API/api.js');

var testBittrexApi = false;

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