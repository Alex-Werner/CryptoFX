const _ = require('lodash');
const Strategy = require('../strategies/strategy')

//Todo : Keep strategy here, but move StochRSI as an indicators and just use it for trend calc
class UltimateOscillator extends Strategy {
  constructor(opts) {
    super();
    this.considered = 0;

    this.lastValue = 0;
    this.currValue = 0;
    this.result = 0;
    }


  consider(el) {
    this.lastValue = this.currValue;
    this.currValue = el.indicators['UltimateOscillator'];
    this.considered++;
    this.calculate();
  }

  calculate() {
    this.result = 0;
    if((this.currValue>=50 && this.lastValue<50)){
      this.result = 1;
    }
    else if(this.currValue<=50 && this.lastValue>50){
      this.result = -1;
    }
    else if(this.currValue>70){
      this.result=-1;
    }
    else if(this.currValue<30){
      this.result=1;
    }

  }

};
module.exports = UltimateOscillator
