const Indicator = require('./indicator')
const EMA = require('./EMA')

//Percentage Price Oscillator
class PPO extends Indicator {
  constructor(opts){
    super();
    this.period = opts.period;
    this.result = 0;
    this.pushed = 0;
    this.lastValue = 0;

    this.firstSmoothing = new EMA({period:opts.long});

    this.inner = new EMA({period:opts.long})
    this.outer = new EMA({period:opts.short})

    this.signal = new EMA({period:opts.signal})
    this.histogram = 0;
  }
  push(candle, source = 'close'){
    this.currValue = (this.isNumber(candle)) ? candle : candle[source];
    if(this.pushed===0) this.result = this.currValue;


    this.inner.push(this.currValue);
    this.outer.push(this.currValue);


    this.pushed++;
    this.calculate();
    this.lastValue = this.currValue;
  }
  calculate(){
    this.result = 100 * ((this.outer.get()-this.inner.get()) / this.inner.get())
    this.signal.push(this.result)
    this.histogram=(this.get()-this.getSignal());
  }
  getSignal(){
    return this.signal.result;
  }
  getHistogram(){
    return this.histogram;
  }
}
;
module.exports = PPO