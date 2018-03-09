const log = console.log;
const Logger = require('../utils/Logger');
const _ = require('lodash');

class Fetcher{
  constructor(opts){
    this.markets = [];
    if(opts!==null){
      if(_.has(opts,'logPath')){
        console.log('Should store in specific path')
      }
      if(_.has(opts, 'markets') && opts.markets.constructor.name === 'Array'){
        this.markets = opts.markets;
      }
    }
    console.log('Fetcher service initialisated');
  }
  start(){
    console.log('Start fetching...');
  }
}
module.exports = Fetcher;