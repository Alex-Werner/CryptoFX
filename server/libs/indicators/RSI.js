const _ = require('lodash');
const Indicator = require('../indicators/indicator')
const SMMA = require('../indicators/SMMA')

//Relative Strength Index
class RSI extends Indicator {
  constructor(opts){
    super();
    // if(!opts || !_.has(opts, 'period') || !_.has(opts, 'values')){
    //   return false;
    // }
    //
    // this.period = opts.period;
    // this.values = opts.values;
    //
    // this.results = null;
    this.averageGain = new SMMA({period:opts.period});
    this.averageLoss = new SMMA({period:opts.period});
    this.pushed = 0;
    this.result = 0;
  }

  push(candle,source = 'close'){
    this.currValue = (this.isNumber(candle)) ? candle : candle[source];
    if(!_.has(this, 'lastValue')){
      this.lastValue = this.currValue;
      this.pushed++;
      return;
    }

    if(this.currValue> this.lastValue){
      this.gain = this.currValue - this.lastValue;
      this.loss = 0;
    }else{
      this.loss = this.lastValue - this.currValue;
      this.gain=0;
    }

    this.update(this.averageGain, this.gain);
    this.update(this.averageLoss, this.loss);
    this.lastValue = this.currValue;
    this.pushed++;
    this.calculate()
  }

  update(obj, value){
    if(obj.constructor.name === 'SMMA')
      obj.push(value);
  }
  calculate(opts){
    this.rs = this.averageGain.get()/this.averageLoss.get() || 0;
    if(this.averageLoss.get() === 0 && this.averageGain.get() !== 0)
      this.result = 100;
    else
      this.result = 100-(100/(1+this.rs))
  }
};
module.exports = RSI
