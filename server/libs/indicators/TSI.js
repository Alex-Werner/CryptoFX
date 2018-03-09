const Indicator = require('./indicator')
const EMA = require('./EMA')

//True Strength Index
class TSI extends Indicator {
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

      this.absInner = new EMA({period:opts.long})
      this.absOuter = new EMA({period:opts.short})
    }
    push(candle, source = 'close'){
      this.currValue = (this.isNumber(candle)) ? candle : candle[source];
      this.currValue *= 10000;
      if(this.pushed===0) this.result = this.currValue;

      let momentum = this.currValue - this.lastValue;

      this.firstSmoothing.push(this.currValue);

      this.inner.push(momentum);
      this.outer.push(this.inner.get());

      this.absInner.push(Math.abs(momentum));
      this.absOuter.push(this.absInner.get());

      this.pushed++;
      this.calculate();
      this.lastValue = this.currValue;
    }
    calculate(){
      this.result = 100 * (this.outer.get() / this.absOuter.get())
      this.signal.push(this.result)

      // this.result = 100 * (this.outer.get())
    }
    getSignal(){
      return this.signal.result;
    }
}
;
module.exports = TSI