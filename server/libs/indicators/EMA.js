const Indicator = require('./indicator')
//Exponential Moving Average
class EMA extends Indicator {
  constructor(opts){
    super();
    this.period = opts.period;
    this.result = 0;
    this.pushed = 0;

  }
  push(candle, source = 'close'){
    this.currValue = (this.isNumber(candle)) ? candle : candle[source];

    if(this.pushed===0) this.result = this.currValue;

    this.pushed++;

    this.calculate();
  }
  calculate(){
    let weightFactor = 2 / (this.period+1);
    let yesterdayValue = this.result;
    this.result = this.currValue * weightFactor + yesterdayValue * (1-weightFactor);
  }
};
module.exports = EMA