const _ = require('lodash');
const Strategy = require('../strategies/strategy')

class LongTrendAnalysis extends Strategy {
  constructor(opts) {
    super();
    this.currentState = {};
    this.considered = 0;
  }

  set(val) {
    this.currentState.result = val;
  }

  consider(el) {
    if(
      el.indicators.EMA20 > el.indicators.EMA200 &&
      el.indicators.EMA40 > el.indicators.EMA200 &&
      el.indicators.EMA60 > el.indicators.EMA200 &&
      el.indicators.EMA80 > el.indicators.EMA200 &&
      el.indicators.EMA100 > el.indicators.EMA200 &&
      el.indicators.EMA150 > el.indicators.EMA200
    ){
      this.set(1);
    }
    else if(
      el.indicators.EMA20 < el.indicators.EMA200 &&
      el.indicators.EMA40 < el.indicators.EMA200 &&
      el.indicators.EMA60 < el.indicators.EMA200 &&
      el.indicators.EMA80 < el.indicators.EMA200 &&
      el.indicators.EMA100 < el.indicators.EMA200 &&
      el.indicators.EMA150 < el.indicators.EMA200
    ){
      this.set(-1);
    }else{
      this.set(0);
    }

    this.considered++;
  }
  get(){
    return this.currentState.result;
  }
};
module.exports = LongTrendAnalysis
