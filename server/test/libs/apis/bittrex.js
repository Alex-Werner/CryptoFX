const mocha = require('mocha');
const assert = require('chai').assert;

const Bittrex = require('../../../libs/apis/bittrex.js');

describe('APIs - Bittrex', () => {
  it('should answer market data', async function (done) {
    let bittrex = new Bittrex();

    console.log(await bittrex.getTickerV2('BTC-DASH','day'))
    // let markets = await bittrex.getMarkets();
    // let currencies = await bittrex.getCurrencies();

    // console.log({
    //   markets,
    //   currencies
    // })
    await done;
  });

});
/*
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
});*/