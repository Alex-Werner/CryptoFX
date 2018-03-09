const _ = require('lodash');
const Strategy = require('../strategies/strategy')

class GoldenCross extends Strategy {
  constructor(opts) {
    super();
    this.lastState = {
      isAbove:false,
      isBelow:true,
      isEven : false
    };
    this.currentState = {};

    this.considered = 0;
    this.lastResult = false;
    this.lastStateAge = 0;
    this.stateAge = 0;
  }

  set(val) {
    this.lastState = this.currentState;
    this.currentState.result = val;
    this.currentState.age = 0;
  }

  consider(el) {

    // GoldenCross happen on this case :
    // Initial : shortTerm is below long term
    // Cross : shortTerm meet longterm and go beyond
    let shortTerm = el.indicators.SMA50;
    let longTerm = el.indicators.SMA100;

    this.currentState = {
      isAbove :shortTerm > longTerm,
      isBelow :shortTerm < longTerm,
      isEven :shortTerm === longTerm
    };

    if (this.currentState.isAbove && this.lastState.isAbove===false){
      this.set(true)
    }
    else{
      this.set(false);
    }

    this.considered++;
    this.currentState.age++;
  }
  get(){
    return this.currentState.result;
  }
};
module.exports = GoldenCross
