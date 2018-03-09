const _ = require('lodash');
const Indicator = require('../indicators/indicator')
const LRC = require('../indicators/LRC')

//Moving Average Convergence Divergence
class CCI extends Indicator {
  constructor(opts) {
    super();
    this.short = new EMA({period:opts.short})
    this.long = new EMA({period:opts.long})
    this.signal = new EMA({period:opts.signal})
    this.histogram = 0;
  }
  push(candle,source = 'close') {
    this.currValue = (this.isNumber(candle)) ? candle : candle[source];

    this.short.push( this.currValue )
    this.long.push( this.currValue )
    this.calculate();


  }
  calculate(opts) {
    this.shortEMA = this.short.get();
    this.longEMA = this.long.get();

    this.result = this.shortEMA  - this.longEMA;
    this.signal.push( this.result )

    this.histogram = this.result - this.signal.get();

  }
};
module.exports = CCI