const cl = console.log;
const chalk = require('chalk');
const util = require('util')
const init = chalk.hex('#996633');
const process = chalk.hex('#0066ff').underline
const error = chalk.hex('#ff0066');
const warning = chalk.hex('ffcc00');
const result = chalk.hex('00ff00');


const Wallet = require('./wallet.js');
const Candle = require('../libs/candle');
const Candles = require('../libs/candles');
const Trader = require('./Trader');

const importData = require('./import.js');
const calculateCandle = require('./calculate.js');
const chart = require('./chart');


cl('\n')
cl(init('-- TerminalBot v0.1 ---'));
cl(process('1) Importing Candle'));
let curr = 'dash';
let candles = importData(curr);
let lastPrice = candles.candles[candles.candles.length - 1].close
cl(process('2) Run Calculation'));
candles = calculateCandle(candles);

cl(process('3) Starting Backtest Wallet'));
let wallet = new Wallet(curr);

let daysRunningTime = 21;
let candleList = candles.candles;


let market = 'DASH-BTC';
let exchange = 'bittrex'
let timeframe = '1d';

let Alice = new Trader();
Alice.candles.addMany({candles: candleList, exchange, market});

Alice.balance.add({
  exchange,
  currency: 'btc',
  sum: 2
});
Alice.balance.add({
  exchange,
  currency: 'dash',
  sum: 30
});

const conditionnalCallback = function (el, i, c) {
  let TAS = el.strategies.ShortTrendAnalysis;

  let high = 0; //el.signals.TechnicalAnalysisSummary.nb *0.7
  let low = 0;//-high;

  let baseCurr = market.split('-')[1];
  let tradingCurr = market.split('-')[0];

  let baseBal = Alice.getBalance({exchange, currency: baseCurr});
  let tradeBal = Alice.getBalance({exchange, currency: tradingCurr});

  let h = el.signals.TechnicalAnalysisSummary.pi.calculations.tom.h;
  let l = el.signals.TechnicalAnalysisSummary.pi.calculations.tom.l

  let fibor1 = el.signals.TechnicalAnalysisSummary.pi.calculations.fibo.r1;
  let fibos1 = el.signals.TechnicalAnalysisSummary.pi.calculations.fibo.s1;

  let camarir2 = el.signals.TechnicalAnalysisSummary.pi.calculations.camarilla.r2;
  let camaris2 = el.signals.TechnicalAnalysisSummary.pi.calculations.camarilla.s2


  let fcr2 = el.signals.TechnicalAnalysisSummary.pi.calculations.fc.r2;
  let fcs2 = el.signals.TechnicalAnalysisSummary.pi.calculations.fc.s2

  let camar1 = el.si


  let allowsell = true;
  let allowbuy = true;

  let buyPercentOfBal = 5;
  let sellPercentOfBal = 5;

  if (TAS < low) {
    let qty = (tradeBal * (sellPercentOfBal/100));

    if (l < el.close && h > el.close && allowsell)  {
      Alice.orders.create({
        direction: 'sell',
        price: el.close,
        tp: [
          {price: l, qtyPercent: 20},
          {price: fibos1, qtyPercent: 40},
          {price: camaris2, qtyPercent: 40},
          {price: fcs2, qtyPercent: 100}
        ],
        sl: fcr2,
        qty: qty,
        exchange, market
      })
    }


  } else if (TAS > high && allowbuy) {
    let qty = baseBal * (buyPercentOfBal/100) / el.close
    Alice.orders.create({
      direction: 'buy',
      price: el.close,
      tp: [
        {price: h, qtyPercent: 20},
        {price: fibor1, qtyPercent: 40},
        {price: camarir2, qtyPercent: 40},
        {price: fcr2, qtyPercent: 100}
      ],
      sl: fcs2,
      qty: qty,
      exchange, market
    })

  }
};
const resultCallback = function (a, b, c) {
  cl(a, b, c)
}
// Alice.use('signals','TechnicalAnalysisSummary', condition);


let startingCandle = (candleList.length > daysRunningTime) ? candleList[(candleList.length - daysRunningTime)].timestamp : 0
cl('------ Run Backtest')
Alice.runBacktest({startingCandle, timeframe, market, exchange}, conditionnalCallback, resultCallback)

cl('------ Alice Exchanges')
console.log(Alice.exchanges.bittrex.balance)

// wallet.runBacktest({ candles : candleList, startingCandle});

cl(result('Ran during : ', Alice.activePeriod, 'days'))
cl(result('Starting Balance :', JSON.stringify(Alice.oldBalance), `(${Alice.balanceHistory[0]})`))
cl(result('Current Price : ', lastPrice))
cl(result('Total Balance : ', JSON.stringify(Alice.exchanges[exchange].balance)))
cl(result('Estimated Balance : ', Alice.exchanges[exchange].balance.btc.available + (Alice.exchanges[exchange].balance.dash.available * lastPrice)))
cl(result('Profit : ', Alice.balanceHistory[Alice.balanceHistory.length - 1] - Alice.balanceHistory[0]))

throw new Error();
let candleChartList = (candles.candles.length > 200) ? candles.candles.slice(candles.candles.length - 200) : candles.candles;
let signalList = candleChartList.reduce(function (acc, el) {
  acc.push(el.signals.CryptoSignal1)
  // acc.push(el.strategies.ShortTrendAnalysis)
  // acc.push(el.strategies.LongTrendAnalysis)
  return acc;
}, []);
let taSignalList = candleChartList.reduce(function (acc, el) {
  acc.push(el.signals.TechnicalAnalysisSummary.sum)
  // acc.push(el.strategies.ShortTrendAnalysis)
  // acc.push(el.strategies.LongTrendAnalysis)
  return acc;
}, []);


//Price Chart
let priceList = candleChartList.reduce(function (acc, el) {
  acc.push(el.close)
  return acc;
}, []);
cl('******************************************************* Price *******************************************************')
chart(priceList, 'xs');


let testel = 'LongTrendAnalysis'
cl('******************************************************* ' + testel + ' *******************************************************')
let testList = candleChartList.reduce(function (acc, el) {
  // acc.push(el.indicators[testel])
  acc.push(el.strategies[testel])
  return acc;
}, []);
chart(testList, 'xs')

let testel2 = 'ShortTrendAnalysis'
cl('******************************************************* ' + testel2 + ' *******************************************************')
let testList2 = candleChartList.reduce(function (acc, el) {
  // acc.push(el.indicators[testel])
  acc.push(el.strategies[testel2])
  return acc;
}, []);
chart(testList2, 'xs')

cl('******************************************************* CryptoSignal1 *******************************************************')
chart(signalList, 'xs')

cl('******************************************************* TA Signal *******************************************************')
chart(taSignalList, 'xs')


cl('******************************************************* Balance *******************************************************')

let balanceList = [];
Alice.balanceHistory.filter(function (el) {
  balanceList.push(el)
})

balanceList = (balanceList.length > 200) ? balanceList.slice(balanceList.length - 200) : balanceList;

chart(balanceList, 'xs')


//
// cl(error('Error'));
// cl(warning('warning'));
cl('\n');
// cl(candles.candles[0])
// cl(candles.candles[10])
// cl(candles.candles[100])
// cl(candles.candles[900])
// cl(candles.candles[955])
// cl(util.inspect(candles.candles[candles.candles.length-1],{depth:6}))
// cl(util.inspect(candles.candles[candles.candles.length-175],{depth:6}))
// cl(util.inspect(candles.candles[candles.candles.length - 1], {depth: 6}))