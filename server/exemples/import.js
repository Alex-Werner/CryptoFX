// const dataset = require('./data.js');
const moment = require('moment');
const Candles = require('../libs/candles');
const Timeframe = require('../libs/timeframe');
const Candle = require('../libs/candle');
const cl = console.log
module.exports = function(curr){
  const dataset = require('./data/'+curr+'.js');

  let datasetItemNb = 1000
  let skipLastNbCandle = 0
  let len = dataset.result.length;
  let candles = new Candles();
  let lastTime = +new Date()
//Will add from the end;
  for(let i = dataset.result.length-1-skipLastNbCandle;  i>0 && i> dataset.result.length-1-skipLastNbCandle-datasetItemNb; i--){
    let el = dataset.result[i];
    candles.add(new Candle({
      open:el['O'],
      close:el['C'],
      volume:el['V'],
      BTCvolume:el['BV'],
      timestamp:moment(`${el['T']}Z`).utc().unix(),//26
      low:el['L'],
      high:el['H'],
      timeframe:new Timeframe('1d')
    }))
    let nb = len-1-i
    let total = (datasetItemNb>len) ? len : datasetItemNb;
    // cl(`[${((100/((total/nb)))).toFixed(2)} %] Candle ${nb} added (${el['T']})`)
  }
  let processTime = +new Date()-lastTime
  cl(`[100%] Candled Added (${candles.candles.length} candles)  - Took ${processTime} ms`)
  return candles;
}