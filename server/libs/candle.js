const _ = require('lodash');
const moment = require('moment')
class Candle {
  constructor(opts){
    this.timeframe = opts.timeframe;
    this.open = opts.open;
    this.close = opts.close;
    this.volume = opts.volume;
    this.BTCvolume = opts.BTCvolume;
    this.timestamp = opts.timestamp;
    this.time = moment.unix(this.timestamp).format();
    this.low = opts.low;
    this.high = opts.high;
    this.indicators={}
    this.strategies={}
    this.signals={}
  }
  validate(){
    let self = this;
    let valid = true;
    Object.keys(self).forEach(function(el){
      if(self[el]===undefined){
        valid=false;
      }
    })
    return valid;
  }
}

module.exports = Candle