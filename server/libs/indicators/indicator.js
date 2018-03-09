class Indicator {
  constructor(opts){
    this.result = null;

  }
  get(){
    return this.result;
  }
  calculate(){
    return;
  }
  isNumber(nb){
    return nb.constructor.name==='Number'

  }
}
module.exports = Indicator