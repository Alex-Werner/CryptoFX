const _ = require('lodash');
const Indicator = require('../indicators/indicator')
const SMA = require('../indicators/SMA')

//Relative Strength Index
class StochRSI extends Indicator {
  constructor(opts){
    super();

    this.pushed = 0;
    this.history = [];
    this.period = opts.interval || 10;
    this.smooth = opts.smooth || 3;

    this.averageStochRSI = new SMA({period:this.smooth});

    this.result = 0;
  }

  push(candle,source = 'close'){
    this.rsi = candle.indicators.RSI14;
    this.history.push(this.rsi);

    if (this.history.length > this.period) {
      this.history.shift();
    }
    this.pushed++;
    this.calculate()
  }
  calculate(opts){

    this.lowestRSI = _.min(this.history);
    this.highestRSI = _.max(this.history);

    let stoch =  (((this.rsi - this.lowestRSI) / (this.highestRSI - this.lowestRSI)) * 100 ) || 0;
    stoch = parseFloat(stoch.toPrecision(4));
    this.averageStochRSI.push(stoch);

    this.result = this.averageStochRSI.get()

  }
};
module.exports = StochRSI
