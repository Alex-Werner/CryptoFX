const _ = require('lodash');
const Bittrex = require('../../libs/apis/bittrex')
const fs = require('fs');

let marketList = [];
let bittrex = new Bittrex();


function importMarket(pair) {
  bittrex.getTickerV2(pair,'day').then(function (tick) {
    let content  = ('module.exports ='+ tick)
    let againstPair = pair.split('-')[1];
    let fileName = againstPair+'.js';
    fs.writeFile(fileName, content, 'utf8', (err) => {
      if (err) throw err;
      console.log("The file was succesfully saved!");
    });
  })

}
async function startProcess(){
  let marketSum = require('./marketSum')

  // let marketSum = await bittrex.getMarketsV2();
  //  marketSum = JSON.parse(marketSum)

  // marketSum.result = marketSum.result.splice(0,1)
  _.each(marketSum.result, function (el, i) {
    let market = el.Market.MarketCurrency
    let base = el.Market.BaseCurrency;
    if(base==='BTC'){}
      marketList.push(market);

  })
    marketList = ['DASH']
  _.each(marketList, function(el,i){
    let pair = 'BTC-'+el.toUpperCase();
    importMarket(pair);
  })
  console.log(marketList)
}

startProcess();
setInterval(startProcess, 1*60*1000)