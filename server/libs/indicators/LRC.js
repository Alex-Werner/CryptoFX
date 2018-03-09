const _ = require('lodash');
const Indicator = require('../indicators/indicator')

class LRC extends Indicator {
  constructor(opts) {
    super();
    this.result = 0;
  }
  push(candle,source = 'close') {
    this.calculate();


  }
  calculate(opts) {
    this.result=0
  }
};
module.exports = LRC