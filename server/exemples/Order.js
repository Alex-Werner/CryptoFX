class Order {
  constructor(settings) {
    let direction = settings.direction;
    let price = settings.price;
    let tp = settings.tp;
    let sl = settings.sl;
    let qty = settings.qty;

    ;
    this.market = settings.market.toLowerCase();
    this.exchange = settings.exchange;

    this.direction = direction;
    this.entryPrice = price;
    this.qty = qty;
    this.cost = this.qty * this.entryPrice;
    this.tp = tp;
    this.sl = sl;
    this.profit = 0;
    this.open = true
    this.considered = 0;
    // console.log(this);
  }
  consider(candle){
    if(this.open){
      this.profit = this.qty*(candle.close - this.entryPrice);
      if(this.direction==='buy'){
        if(candle.close>this.tp || candle.high>this.tp){
          // console.log('Close order TP',this.profit.toFixed(5))
          return this.close();
        }else if(candle.close<this.sl || candle.low<this.sl ){
          // console.log('Close order SL', this.entryPrice, candle.close, this.sl, this.tp, candle.low)
          return this.close();
        }
      }else{
        if(candle.close<this.tp || candle.low<this.tp){
          // console.log('Close order TP',this.profit.toFixed(5))
          return this.close();
        }else if(candle.close>this.sl || candle.high>this.sl ){
          // console.log('Close order SL', this.entryPrice, candle.close, this.sl, this.tp, candle.low)
          return this.close();
        }
      }

      this.considered++;
    }
    return null;

  }
  close(){
    this.open = false;
    return this.profit;
  }
}
module.exports = Order;