const util = require('util');
const data = require('./exemples/data.js');
const insp = util.inspect;
const cl = console.log;
const _ = require('lodash')
const moment = require('moment');
const Candle = require('./libs/candle');
const Candles = require('./libs/candles');
const Timeframe = require('./libs/timeframe');
const SMA = require('./libs/indicators/SMA');
const RSI = require('./libs/indicators/RSI');
const SMMA = require('./libs/indicators/SMMA');
const asciichart = require ('asciichart')

cl(`Time now: ${moment().utc().format()}, ${moment().utc().unix()}`);
cl(`Time at midnight : ${moment().utc().startOf('day')}, ${moment().utc().startOf('day').unix()}`)

cl(moment('2018-01-26T00:00:00Z').utc().unix())
cl(moment(1517184000000).utc().format())
cl('----Starting---')

// let rsi = new RSI({period:4});
// cl(rsi.push(800));
// cl(rsi.push(788));
// cl(rsi.push(758));
// cl(rsi.push(708));
// cl(rsi.push(900));
// cl(rsi.push(1));
// cl(rsi.push(1));
// cl(rsi.push(1));
// cl(rsi.get(1));
// throw new Error()
// let sma = new SMMA({period:4});
// cl(sma.push(1));
// cl(sma.push(1.1));
// cl(sma.push(1.21));
// cl(sma.push(1.44));
// cl(sma.push(1.55));
// cl(sma.push(2.1));
// cl(sma.push(2.9));
// cl(sma.push(5));
// cl(sma.push(2));
// cl(sma.push(3));
// cl(sma.push(4));
// cl(sma.push(5));
// cl(sma.push({close:5}));
// cl(sma.push({close:1}));
// cl(sma.push({close:1}));
// cl(sma.push({close:1}));
// cl(sma.push({close:1}));
// cl(sma.push({close:1}));
// cl(sma.push({close:1}));
// cl(sma.push({close:1}));
// cl(sma.push({close:3}));
// cl(sma.get());


let candles = new Candles;

let lastTime = +new Date();
let processTime = 0;

let datasetItemNb = 100
let skipLastNbCandle = 100

let len = data.result.length;
//Will add from the end;
for(let i = data.result.length-1-skipLastNbCandle;  i>0 && i> data.result.length-1-skipLastNbCandle-datasetItemNb; i--){
  let el = data.result[i];
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
processTime = +new Date()-lastTime
cl(`[100%] Candled Added (${candles.candles.length} candles)  - Took ${processTime} ms`)
cl(`Imported ${100/(data.result.length/candles.candles.length)} % of dataset / Max : ${data.result.length}`)
lastTime = +new Date();
candles.calculate();
processTime = +new Date()-lastTime
cl(`[100 %]Candle calcultated - Took ${processTime} ms`);
cl(`Dernier candle : `, candles.candles[candles.candles.length-1])

let priceList = [];
let signalsList = [];
let rsiList = [];
_.each(candles.candles, function (el, i) {
  if(i>candles.candles.length-160){
    rsiList.push(el.indicators.RSI14);
    priceList.push(el.close);
    signalsList.push(el.signals.CryptoSignal1);
  }


})
displayChart(priceList);
displayChart(rsiList);
displayChart(signalsList);

// let cslen = candles.candles.length;
// let cs = candles.candles.slice(cslen-5)
// cl(insp(cs,{depth:4}));


function displayChart(list) {
  let s0 = new Array(list.length);

  for (let i = 0; i < list.length; i++){
    s0[i] = list[i]
  }
  console.log (asciichart.plot(s0, {
    offset:50,
    height:20
  }))
}

cl(`Start Backtesting Simulaor :`)
let balance = 100;
let soldeList = [];

