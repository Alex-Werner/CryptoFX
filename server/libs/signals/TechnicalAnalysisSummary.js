const Signal = require('./signal')
const _ = require('lodash')

class TechnicalAnalysisSummary extends Signal {
  constructor(opts) {
    super();
    //Weight from 0 to 10
    this.specs = opts.specs;

    this.results = [];
    this.calculations = {
      oscillators: {},
      movingAverages: {},
      // trendReversal:
      pivots: {},
    };
    this.result = 0;
    this.considered = 0;
  }

  consider(el, candles) {
    this.calculate(el, candles)
    this.considered++;
  }

  calculate(el, candles) {
    let osc = this.calculations.oscillators;
    osc.rsi = {val: el.indicators.RSI14};
    osc.rsi.action = (osc.rsi.val<20) ? 1 : (osc.rsi.val>80) ? -1 : 0;

    osc.stochRSI ={val:el.strategies.StochRSI};
    osc.stochRSI.action = (osc.stochRSI.val)

    // osc.stochFast = {vol: 55, action: 0};
    // osc.commodityChannelIndex = {val: 19, action: 0};
    // osc.averageDirectionalIndex = {val: 29, action: 0}
    // osc.awesomeOscillators = {val: 0.000206, action: 1}

    osc.momentum = {val:el.indicators.Momentum10};
    osc.momentum.action = (osc.momentum.val<0) ? -1 : (osc.momentum.val===0) ? 0 : 1;

    osc.macdLevel = {val:el.indicators.MACD}
    osc.macdLevel.action = (osc.macdLevel.val<0) ? -1 : (osc.macdLevel.val===0) ? 0 : 1;
    // osc.stochRSIFast = {val: 71, action: 0}
    // osc.williamsPercentRange = {val: -44, action: 0}
    // osc.bullBearPower = {val: 0.000087, action: 0}


    osc.ultimateOscillator = {val: el.strategies.UltimateOscillator};
    osc.ultimateOscillator.action =  osc.ultimateOscillator.val;



    let ma = this.calculations.movingAverages;
    //el.last may be instead ? It would allow to have a dynamic handling.
    ma.EMA5 = {val: el.indicators.EMA5, action: (el.close > el.indicators.EMA5) ? 1 : -1}
    ma.SMA5 = {val: el.indicators.SMA5, action: (el.close > el.indicators.SMA5) ? 1 : -1}

    ma.EMA10 = {val: el.indicators.EMA10, action: (el.close > el.indicators.EMA10) ? 1 : -1}
    ma.SMA10 = {val: el.indicators.SMA10, action: (el.close > el.indicators.SMA10) ? 1 : -1}

    ma.EMA20 = {val: el.indicators.EMA20, action: (el.close > el.indicators.EMA20) ? 1 : -1}
    ma.SMA20 = {val: el.indicators.SMA20, action: (el.close > el.indicators.SMA20) ? 1 : -1}

    ma.EMA30 = {val: el.indicators.EMA30, action: (el.close > el.indicators.EMA30) ? 1 : -1}
    ma.SMA30 = {val: el.indicators.SMA30, action: (el.close > el.indicators.SMA30) ? 1 : -1}

    ma.EMA50 = {val: el.indicators.EMA50, action: (el.close > el.indicators.EMA50) ? 1 : -1}
    ma.SMA50 = {val: el.indicators.SMA50, action: (el.close > el.indicators.SMA50) ? 1 : -1}

    ma.EMA100 = {val: el.indicators.EMA100, action: (el.close > el.indicators.EMA100) ? 1 : -1}
    ma.SMA100 = {val: el.indicators.SMA100, action: (el.close > el.indicators.SMA100) ? 1 : -1}
    //
    ma.EMA200 = {val: el.indicators.EMA200, action: (el.close > el.indicators.EMA200) ? 1 : -1}
    ma.SMA200 = {val: el.indicators.SMA200, action: (el.close > el.indicators.SMA200) ? 1 : -1}

    //Ichimoku cloud base line
    // ma.ICBL = {val: 0.00268, action: 0}

    //Volume Weighted Moving Average
    // ma.VWMA = {val: 0.00268, action: -1}

    //Hull Moving Average
    // ma.HMA = {val: 0.00268, action: -1}

    let pi = this.calculations.pivots;

    let pivotCandle = candles[this.considered - 1] || el;
    let prevCandle = candles[this.considered - 2] || pivotCandle;


    let low = pivotCandle.low;
    let open = pivotCandle.open;
    let close = pivotCandle.close;
    let high = pivotCandle.high;


    //floor classic
    pi.fc = {};
    //pivot
    pi.fc.p = (high + low + close) / 3;
    //Resistance
    pi.fc.r3 = pi.fc.p  + ((high - low) * 2);
    pi.fc.r2 = pi.fc.p + (high - low);
    pi.fc.r1 = (2 * pi.fc.p) - low;
    //Support
    pi.fc.s1 = (2 * pi.fc.p) - high;
    pi.fc.s2 = pi.fc.p - (high - low);
    pi.fc.s3 = pi.fc.p - (high-low) * 2;
;

    //Camarilla (good for stop-loss & profit-target
    pi.camarilla = {};
    pi.camarilla.p = (high + low + close) / 3;

    //Resistance
    pi.camarilla.r1 = (high - low) * 1.1 / 12 + close;
    pi.camarilla.r2 = (high - low) * 1.1 / 6 + close;
    pi.camarilla.r3 = (high - low) * 1.1 / 4 + close;
    pi.camarilla.r4 = (high - low) * 1.1 / 2 + close;
    //Support
    pi.camarilla.s1 = close - (high - low) * 1.1 / 12;
    pi.camarilla.s2 = close - (high - low) * 1.1 / 6;
    pi.camarilla.s3 = close - (high - low) * 1.1 / 4;
    pi.camarilla.s4 = close - (high - low) * 1.1 / 2;


    //Woodie (more weight to prevPeriod.close)
    pi.woodie = {};

    pi.woodie.p = (high + low + (2 * close)) / 4;
    //Resistance
    pi.woodie.r1 = (2 * pi.fc.p) - low;
    pi.woodie.r2 = pi.fc.p + high - low;
    pi.woodie.r3 = high + 2 * (pi.fc.p - low);
    //Support
    pi.woodie.s1 = (2 * pi.fc.p) - high;
    pi.woodie.s2 = pi.fc.p - high + low
    pi.woodie.s3 = low - 2 * (high - pi.fc.p);

    //Fibo
    pi.fibo = {};
    pi.fibo.p = (high + low + close) / 3;
    pi.fibo.r1 = pi.fibo.p + ((high - low) * 0.382);
    pi.fibo.r2 = pi.fibo.p + ((high - low) * 0.618);
    pi.fibo.r3 = pi.fibo.p + ((high - low) * 1);

    pi.fibo.s1 = pi.fibo.p - ((high - low) * 0.382);
    pi.fibo.s2 = pi.fibo.p - ((high - low) * 0.618);
    pi.fibo.s3 = pi.fibo.p - ((high - low) * 1);


    //Tom DeMark's (forecast the future of the trends - predicted low/highs)
    let x = 0;
    if (close < open) x = high + 2 * low + close;
    if (close > open) x = 2 * high + low + close;
    if (close === open) x = high + low + 2 * close;
    pi.tom = {h: x / 2 - low, l: x / 2 - high};
    pi.tom.p = (pi.tom.h+pi.tom.l) /2 ;


    // let highList = candles.map(c => c.high);//list of high value
    // let lowList = candles.map(c => c.low);//List of lows
    // let closeList = candles.map(c => c.close);//List of closes
    // pi.fc = floorPivots(highList, lowList, closeList);


    this.maResult = {
      result: 0,
      bear:0,
      bull:0,
      neutral:0,
      calculations:{}
    };
    //Between
    this.oscResult = {
      result: 0,
      bear:0,
      bull:0,
      neutral:0,
      calculations:{}
    }

    this.piResult ={
      p:0,
      r1:0,
      r2:0,
      calculations:{}
    };

    let self = this;
    _.each(ma, function (el,i) {
      self.maResult.bull += (el.action===1)? 1 : 0;
      self.maResult.neutral += (el.action===0)? 1 : 0;
      self.maResult.bear += (el.action===-1)? 1 : 0;
      self.maResult.result += el.action;
      self.maResult.calculations[i]=(el);

    })//result is EMA between -1 and 1;

    _.each(osc, function (el, i) {
      self.oscResult.bull += (el.action===1)? 1 : 0;
      self.oscResult.neutral += (el.action===0)? 1 : 0;
      self.oscResult.bear += (el.action===-1)? 1 : 0;
      self.oscResult.result += el.action;
      self.oscResult.calculations[i]=(el);
    })

    _.each(pi, function (el, i) {
      self.piResult.p = 0;
      self.piResult.r1 = 0;
      self.piResult.s1 = 0;
      if(!_.has(self.piResult.calculations,i)) self.piResult.calculations[i] ={};
      self.piResult.calculations[i]=(el);
    })//result is EMA between -1 and 1;

    this.result = {
      sum: (this.oscResult.result + this.maResult.result),
      nb:Object.keys(this.oscResult.calculations).length + Object.keys(this.maResult.calculations).length,
      ma: this.maResult,
      osc: this.oscResult,
      pi: this.piResult

    }


    if (el.timestamp === 1517443200) {
      let last = this.calculations.pivots.fc.length - 1
      // console.log(this.calculations.pivots.fc[last])
      // console.log(this.calculations.movingAverages)
      // console.log(this.calculations.oscillators)
    }
    // console.log(this.calculations)
    // let last = this.calculations.pivots.length-1
    // console.log(this.calculations.pivots[last])
  }

  get() {
    return this.result;
  }
}

module.exports = TechnicalAnalysisSummary;