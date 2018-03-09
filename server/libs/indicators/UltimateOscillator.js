const Indicator = require('./indicator')
const _ = require('lodash');
const SMA = require('./SMA')

//Smoothed Moving Average
class UltimateOscillator extends Indicator {
  constructor(opts) {
    super();

    this.weights = opts.weights || [4,2,1]

    this.result = 0;
    this.lastClose = 0;
    this.currClose = 0;

    this.short = opts.short || 7;
    this.medium = opts.medium || 14;
    this.long = opts.long || 18;

    // this.longuestPeriod = (_.max([opts.period1, opts.period2, opts.period3])) || 28;

    this.historyBP = [];
    this.historyTR = [];

    this.bpShort = new SMA({period:this.short});
    this.bpMedium = new SMA({period:this.medium});
    this.bpLong = new SMA({period:this.long});

    this.trShort = new SMA({period:this.short});
    this.trMedium = new SMA({period:this.medium});
    this.trLong = new SMA({period:this.long});
  }

  push(candle, source = 'close') {
    if (this.isNumber(candle)) throw new Error('Only valid with candle')

    this.lastClose = this.currClose;

    this.currClose = candle['close'];
    this.currLow = candle['low'];
    this.currHigh = candle['high'];

    this.pushed++;
    this.calculate();
  }

  calculate() {
    let buyingPressure = this.currClose - _.min([this.currLow, this.lastClose])


    this.bpShort.push(buyingPressure)
    this.bpMedium.push(buyingPressure)
    this.bpLong.push(buyingPressure)


    let trueRange = _.max([this.currHigh, this.lastClose]) - _.min([this.currLow, this.lastClose]);

    this.trShort.push(trueRange)
    this.trMedium.push(trueRange)
    this.trLong.push(trueRange)


    let avgPeriodShort = this.bpShort.get() / this.trShort.get();
    let avgPeriodMedium = this.bpMedium.get() / this.trMedium.get();
    let avgPeriodLong = this.bpLong.get() / this.trLong.get();
    // console.log(avgPeriod1, avgPeriod2, avgPeriod3)
    this.result = 100 * ((this.weights[0] * avgPeriodShort) + (this.weights[1]*avgPeriodMedium) + this.weights[2]*avgPeriodLong ) /(this.weights[0]+this.weights[1]+this.weights[2]);
    // console.log(this)
  }
}

module.exports = UltimateOscillator;