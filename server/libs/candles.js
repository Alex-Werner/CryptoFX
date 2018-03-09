const config = require('./config');
const _ = require('lodash')
const cl = console.log;

/*
const signalsList = {
  CryptoSignal1:require('./signals/CryptoSignalt1'),
  TechnicalAnalysisSummary:require('./signals/TechnicalAnalysisSummary'),
}
let indicatorsList = {
  EMA:require('./indicators/EMA'),
  SMA:require('./indicators/SMA'),
  RSI:require('./indicators/RSI'),
  TSI:require('./indicators/TSI'),
  PPO:require('./indicators/PPO'),
}

const strategiesList = {
  GoldenCross:require('./strategies/GoldenCross.js'),
  DeathCross:require('./strategies/DeathCross.js'),
  TSIBearCross:require('./strategies/TSIBearCross.js'),
  TSIBullCross:require('./strategies/TSIBullCross.js'),
  PPOBearCross:require('./strategies/PPOBearCross.js'),
  PPOBullCross:require('./strategies/PPOBullCross.js'),
  LongTrendAnalysis:require('./strategies/LongTrendAnalysis.js'),
  ShortTrendAnalysis:require('./strategies/ShortTrendAnalysis.js'),
}
*/
let indicatorsList= {}, signalsList= {}, strategiesList = {};
Object.keys(config.indicators).map(o=>indicatorsList[o]=require('./indicators/'+o))
Object.keys(config.signals).map(o=> signalsList[o]=require('./signals/'+o))
Object.keys(config.strategies).map(o=>strategiesList[o]=require('./strategies/'+o))


class Candles {
  constructor() {
    this.candles = [];
  }

  add(candle) {
    if (!candle.validate())
      return false;
    if (!this.candles.length) {
      this.candles.push(candle);
      return true;
    }

    this.candles.push(candle);
    this.candles.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });
    return true;
  }

  getTargetOf(searchTimestamp) {
    let minIndex = 0;
    let maxIndex = this.candles.length - 1;
    let currIndex, currEl;
    while (minIndex <= maxIndex) {
      currIndex = (minIndex + maxIndex) / 2 | 0;
      currEl = this.candles[currIndex];

      // console.log(currEl.timestamp < searchTimestamp)
      if (currEl.timestamp < searchTimestamp) {
        minIndex = currIndex + 1;
      }
      else if (currEl.timestamp > searchTimestamp) {
        maxIndex = currIndex - 1;
      }
      else
        return currIndex;
    }
    return maxIndex;
  }
  calculate(){
    let candles = this.candles;
    let len = candles.length;

    let indicators = [];
    let strategies = [];
    let signals = [];

    function attachIndicator(name, settings) {
      if(settings.active===true){
        if(_.has(settings, 'period')){
          let newIndicator = settings;

          newIndicator.name = name;
          newIndicator.indic = new indicatorsList[name](settings);

          indicators.push(newIndicator);
        }else if(_.has(settings, 'periods')){
          _.each(settings.periods, function (period) {
            attachIndicator(name, {period, active:true});
          })
        }
        else if(_.has(settings, 'long') && _.has(settings, 'short')){
          let newIndicator = settings;
          newIndicator.name = name;
          newIndicator.indic = new indicatorsList[name](settings);
          indicators.push(newIndicator);

        }else {
          let newIndicator = settings;
          newIndicator.name = name;
          newIndicator.indic = new indicatorsList[name](settings);
          indicators.push(newIndicator);
        }
      }
    }
    function attachStrategy(name, settings){
      if(settings.active === true){
        let newStrategy = settings;
        newStrategy.name = name;
        newStrategy.strat = new strategiesList[name](settings);
        strategies.push(newStrategy);
      }
    }
    function attachSignal(name, settings){
      if(settings.active === true){
        let newSignal = settings;
        newSignal.name = name;
        newSignal.sig = new signalsList[name](settings);
        signals.push(newSignal);
      }
    }
    _.each(config.indicators, function (settings,indicatorName) {
      attachIndicator(indicatorName, settings);
    })
    _.each(config.strategies, function (settings, strategyName){
      attachStrategy(strategyName, settings);
    })
    _.each(config.signals, function (settings, signalName){
      attachSignal(signalName, settings);
    })


    function runStategies(el) {
      _.each(strategies, function (strategy) {
        let strategyVariableName = strategy.name;
        strategy.strat.consider(el);
        el.strategies[strategyVariableName] = strategy.strat.get();
      })
    }
    function runIndicators(el) {
      _.each(indicators, function (indicator) {

        let indicatorVariableName = indicator.name;
        indicatorVariableName += (indicator.period) ? (indicator.period) : '';
        indicator.indic.push(el);
        let res = indicator.indic.get(el);
        el.indicators[indicatorVariableName] = res;

        if(_.has(indicator.indic, 'signal')){
          el.indicators[indicatorVariableName+'signal'] = indicator.indic.getSignal(el)
        };
        if(_.has(indicator.indic, 'histogram')){
          el.indicators[indicatorVariableName+'histogram'] = indicator.indic.getHistogram(el)
        };

      })
    }
    function runSignals(el) {
      _.each(signals, function (signal) {
        let signalVariableName = signal.name;
        signal.sig.consider(el, candles);
        let res = signal.sig.get(el);
        el.signals[signalVariableName] = res;
      })
    }
    let totalTime = 0;
    let processTime = 0;
    let lastTime = +new Date();

    _.each(candles, function (el,iteration, arr) {

      runIndicators(el);
      runStategies(el);
      runSignals(el);

      let thisTime = +new Date();
      processTime = thisTime-lastTime;
      lastTime = thisTime;
      totalTime+=processTime;
      // cl(`[${(100/(candles.length/iteration)).toFixed(2)} %] Candle ${iteration} Processed - Took ${processTime} ms`);
      //
      // console.log('Candle', iteration)
      // console.log('Calculated indicators', el.indicators)
      // runStategies(el);
      // console.log('Calculated Strategy', el.strategies)
    });

  }
  _calculate() {
    let candles = this.candles;
    let len = candles.length;
    console.log('len',len)

    _.each(candles, function (el,iteration, arr) {
      let lastItem = arr[iteration-1];
      el.indicators.trueRange = Math.abs(el.high-el.low)
      if(iteration>0){
        let change = el.close-lastItem.close;
        let gain = 0;
        let loss = 0;

        el.indicators.percentChange = Math.log(el.close/lastItem.close)*100;
        if(change>0){
          gain=change;
        }
        else if(change<0)
          loss=Math.abs(change);

        el.indicators.change = change;
        el.indicators.gain = gain;
        el.indicators.loss = loss;
      }
      if(iteration>=config.RSI.period-1){
        let start = (iteration+1)-config.RSI.period
        let end = start+config.RSI.period
        let candlesPeriod = candles.slice(start,end);

        let totalGain = candlesPeriod.reduce((acc, cur)=>{
          let base = acc;
          return base+Math.abs(cur.indicators.gain);
        },0);

        let totalLoss = candlesPeriod.reduce((acc, cur)=>{
          let base = acc;
           return base+Math.abs(cur.indicators.loss);
        },0);

        if(!Number.isNaN(totalGain)){

          let avgGain = totalGain/config.RSI.period;
          let avgLoss = totalLoss/config.RSI.period;

          let rs = avgGain/avgLoss;
          // throw new Error(totalGain)
          el.indicators.rs = {}
          el.indicators.rs[`${config.RSI.period}`] = rs;
          el.indicators.rsi={};


          el.indicators.totalGain = totalGain;
          el.indicators.avgGain = avgGain;
          el.indicators.avgLoss = avgLoss;
          if(avgLoss===0){
            el.indicators.rsi[config.RSI.period] = 100;
          }else {
            el.indicators.rsi[config.RSI.period] = 100 - (100 / (1 + rs));

          }
        }



      }

      // console.log(el, i, prev)
    })

    // this.apply('trueRange');
    // if (len>1)
    //   this.apply('basics');
    //
    // if (len >= 5)
    //   this.apply('SMA');
    // if (len >= 14)
    //   this.apply('RSI');

  }


  apply(type, candles = this.candles) {

    let len = candles.length;
    let types = {
      basics:applyBasics,
      SMA:applySMA,
      RSI:applyRSI
    }
    function applySMA() {
      let periods = [5, 20, 50, 100, 150, 200, 250, 300, 400, 500];
      _.each(periods, function (period) {
        if (len >= period) {
          let smas = new SMA({
            period: period,
            values: candles.map(function (el) {
              return el.close
            })
          }).calculate();
          _.each(smas, function (sma, i) {
            candles[period - 1 + i].indicators[`sma${period}`] = sma;
          })
        }
      });
    }

    function applyRSI() {
      let period = 14;
      if (len >= period) {
        let rsis = new RSI({
          period: period,
          values: candles.map(function (el) {
            return el.close
          })
        }).calculate();

        _.each(rsis, function (rsi, i) {
          candles[period - 1 + i].indicators[`rsi${period}`] = rsi;
        })
      }

    }
    function applyBasics(){
      console.log('basics')
      _.each(candles, function (el,i, arr) {
        console.log(arr[i])
        el.indicators.trueRange = Math.abs(el.high-el.low)
        // console.log(el, i, prev)
      })
    }
    types[type](candles);
    // applyBasics();

    // applySMA();
    // applyRSI();
  }

}

module.exports = Candles;

