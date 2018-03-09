const _ = require('lodash');
const Strategy = require('../strategies/strategy')

class ShortTrendAnalysis extends Strategy {
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
      el.indicators.EMA3  > el.indicators.EMA20
      && el.indicators.EMA5 > el.indicators.EMA20
      && el.indicators.EMA7 > el.indicators.EMA20
      && el.indicators.EMA10 > el.indicators.EMA20
      // && el.indicators.EMA20 > el.indicators.EMA50
      // &&  el.indicators.EMA40 > el.indicators.EMA50

    ){
      this.set(1);
    }
    else if(
      el.indicators.EMA3 < el.indicators.EMA20
      && el.indicators.EMA5 < el.indicators.EMA20
      && el.indicators.EMA7 < el.indicators.EMA20
      && el.indicators.EMA10 < el.indicators.EMA20
      // &&  el.indicators.EMA20 < el.indicators.EMA50
      // &&  el.indicators.EMA40 < el.indicators.EMA50

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
module.exports = ShortTrendAnalysis
