const _ = require('lodash');
const Strategy = require('../strategies/strategy')

//Todo : Keep strategy here, but move StochRSI as an indicators and just use it for trend calc
class StochRSI extends Strategy {
  constructor(opts) {
    super();
    this.considered = 0;
    this.history = [];
    this.period = opts.period || 14;

    this.high = opts.high || 80;
    this.low = opts.low || 20;
    this.persistence = opts.persistence || 10;
    this.stochRSI = 0;

    this.set('unknown');
  }

  setIfDifferent(val) {
    if (this.trend.direction === val) {
      return;
    }
    return this.set(val);

  }

  set(val) {
    let trend = {
      duration: 0,
      persisted: 0
    };

    switch (val) {
      case 'high':
        trend.direction = 'high';
        break;
      case 'low':
        trend.direction = 'low';
        break;
      default:
        trend.direction = 'unknown';
        break;
    }
    this.trend = trend;
  }

  consider(el) {
    this.stochRSI = el.indicators['StochRSI'+this.period];
    this.considered++;
    this.calculate();

  }

  calculate() {
    let self = this;

    this.trend.duration++;

    const maybeAdvice = function (result) {
      if (self.trend.persisted === 1) {
        self.result = result; //advice to short
      } else {
        self.result = 0;
      }
    }

    // console.log(this.stochRSI)
    if (this.stochRSI > this.high) {
      this.setIfDifferent('high');

      if (this.trend.duration >= this.persistence)
        this.trend.persisted++;

      maybeAdvice(-1);

    } else if (this.stochRSI < this.low) {
      this.setIfDifferent('low');
      if (this.trend.duration >= this.persistence)
        this.trend.persisted++;

      maybeAdvice(1);

    } else {
      this.trend.duration = 0;
      this.result = 0;
    }
  }

  get() {
    return this.result;
  }
};
module.exports = StochRSI
