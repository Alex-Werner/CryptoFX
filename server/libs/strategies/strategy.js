class Strategy {
  constructor(opts){
    this.result = null;

  }
  consider(){
    return;
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
module.exports = Strategy