const Indicator = require('./indicator');
const _ = require('lodash');

//Exponential Moving Average
class EMA extends Indicator {
  constructor(opts){
    super();
    this.openHistory = [];
    this.period = opts.period;

    this.result = 0;
    this.pushed = 0;

  }
  push(candle, source = 'open'){
    if(this.isNumber(candle)) throw new Error('Only valid with candle')
    //mom of day
    this.currOpen = candle['open']
    this.currClose = candle['close']

    this.openHistory.push(this.currOpen);

    if(this.openHistory.length>this.period)
      this.openHistory.shift();

    this.pushed++;
    this.calculate(candle);
  }
  calculate(candle){
   this.result = (this.currClose - this.openHistory[0]) || 0 ;
  }
};
module.exports = EMA