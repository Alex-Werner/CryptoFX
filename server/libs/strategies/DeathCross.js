const _ = require('lodash');
const Strategy = require('../strategies/strategy')

class DeathCross extends Strategy {
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

    // DeathCross happen on this case :
    // Initial : longTerm is below shortTerm
    // Cross : longTerm meet shortTerm and go above
    let shortTerm = el.indicators.SMA50;
    let longTerm = el.indicators.SMA100;

    this.currentState = {
      isAbove :longTerm > shortTerm,
      isBelow :longTerm < shortTerm,
      isEven :longTerm === shortTerm
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
module.exports = DeathCross
