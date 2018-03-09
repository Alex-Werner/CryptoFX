const Indicator = require('./indicator')
const SMA = require('./SMA')
//Smoothed Moving Average
class SMMA extends Indicator {
  constructor(opts){
    super();
    this.sma = new SMA(opts);
    this.period = opts.period;
    this.pushed = 0;
    this.history = [];
    this.result = 0;
    this.sum = 0;
  }
  push(candle, source = 'close'){
    this.currValue = (this.isNumber(candle)) ? candle : candle[source];

    if (this.pushed<=this.period)
      this.sma.push(candle, source);
    // else
    //   this.history.push(this.currValue);

    this.pushed++;

    // if (this.history.length > this.period) {
    //   let tail = this.history.shift();//remove oldest to keep same window
    // }
    this.calculate();
    // console.log(this)

  }
  calculate() {
    if (this.pushed === this.period)
      this.result = this.sma.get();
    else if(this.pushed>this.period)
      this.result = (this.result * (this.period - 1) + this.currValue)/ this.period;
  }
}
module.exports = SMMA;