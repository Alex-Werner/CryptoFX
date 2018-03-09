const bittrexApiUrl = "https://bittrex.com/api/v1.1/";
const bittrexApi2Url = "https://bittrex.com/Api/v2.0";
const requestP = require('request-promise-native');
const API = require('./api.js');
const pairs = [
  "BTC-DASH"
];

class Bittrex extends API {
  constructor(){
    super();
  }
  call(type, version='v1'){
    if(type==='public'){
      let url = version==='v1' ? bittrexApiUrl : bittrexApi2Url;
      return {
        to:async function (path) {
          url += path;
          console.log(url);
          let res = await requestP(url);
          return res
        }
      }
    }
  }
  async getTicker(){
    return await this.call('public').to('/public/getticker');
  }
  async getTickerV2(pair, interval){
    return await this.call('public','v2').to(`/pub/market/GetTicks?marketName=${pair}&tickInterval=${interval}`)
  }
  async getMarketsV2(pair, interval){
    return await this.call('public','v2').to(`/pub/markets/GetMarketSummaries`)
  }
  async getMarkets(){
    return await this.call('public').to('/public/getmarkets');
  }
  async getCurrencies(){
    return await this.call('public').to('/public/getcurrencies');
  }
  async getMarketHistory(pair){
    if(pairs.contains(pair)){
      return await this.call('public').to('/public/getmarkethistory?markets='+pair)
    }
  }
};
module.exports=Bittrex;