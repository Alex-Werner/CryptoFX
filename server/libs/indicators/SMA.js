const Indicator = require('./indicator')
const _ = require('lodash');
//Simple Moving Average
class SMA extends Indicator {
  constructor(opts) {
    super();
    this.period = opts.period;
    this.pushed = 0;
    this.history = [];
    this.result = 0;
    this.sum = 0;
  }

  push(candle, source = 'close') {
    let currValue = (this.isNumber(candle)) ? candle : candle[source];
    this.sum += currValue;

    this.history.push(currValue);
    this.pushed++;

    if (this.history.length > this.period) {
      this.history.shift();
    }
    this.calculate();
  }
  calculate(){
     this.result = ((_.sum(this.history) || 0) / this.period) || 0;
  }
}

module.exports = SMA;

// const _ = require('lodash');
//
// function average(values){
//   let sum = 0;
//   _.each(values, function (v, i) {
//       sum+=parseFloat(v);
//   })
//   return sum/values.length;
// }
// //Simple Moving Average
// class SMA {
//   constructor(opts){
//     if(!opts || !_.has(opts, 'period') || !_.has(opts, 'values')){
//       return false;
//     }
//
//     this.period = opts.period;
//     this.values = opts.values;
//
//     this.results = null;
//   }
//   calculate(opts){
//     if(this.results){
//       return this.results;
//     }
//     this.results = [];
//     let vals = [];
//     for (let curr = 0; curr<this.values.length; curr++){
//       vals.push(this.values[curr]);
//
//       if(vals.length<this.period){
//         continue;
//       }
//       if(vals.length>this.period){
//         vals.shift();
//       }
//       let avg = average(vals);
//       this.results.push(avg);
//     }
//     return this.calculate(opts);
//   }
// };
// module.exports = SMA
