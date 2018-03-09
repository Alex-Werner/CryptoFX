const _ = require('lodash')
const moment = require('moment');
class Wallet {
  constructor(curr){

    this.sndCurr = curr;

    this.balance = {btc:1};
    this.balance[this.sndCurr]=0;

    this.initialBalance = {btc:1};
    this.balance[this.sndCurr]=0;

    this.activePeriod = 0;
    this.orders = [];
    this.balanceList = [];
  }
  backtest(settings){
    let candles = settings.candles || (()=>{throw new Error('Missing Candles');})();
    let startingCandle = settings.startingCandle || 0;
    let periodLimit = settings.periodLimit || 10000;

    let self = this;
    let close = 0
    _.each(candles, function (el,i) {
      close = el.close;
      if (i>=startingCandle && self.activePeriod<periodLimit){
        let multiplicator = el.signals.TechnicalAnalysisSummary.sum;
        let ts = el.timestamp;

        if(el.signals.TechnicalAnalysisSummary.sum > 0){
          console.log('Signal to sell', el.time, el.close)
          self.sell(close, multiplicator, ts);
        }
        if(el.signals.TechnicalAnalysisSummary.sum < 0){
          console.log('Signal to buy', el.time, el.close)

          self.buy(close, multiplicator, ts);
        }
        self.activePeriod++;
        self.updateBalanceList(close);

      }

      self.calculateOrders(close);

    })
    // console.log(this.orders)
    // console.log(this.balance)
    // console.log(this.getBalance(close))
  }
  buy(price,confidence,ts){
    if(this.orders.length>0 && this.orders[this.orders.length-1].type==='buy') return ;

    // let percent = (2+Math.sqrt(confidence)) / 100; //1% of balance per orders
    let percent = ((confidence)) / 100; //1% of balance per orders

    let qty = (this.balance['btc']>0)? this.balance.btc*percent/price : 0
    let cost = qty * price;
    this.orders.push({
      type:'buy',
      price:price,
      qty:qty,
      cost:cost
    })
    this.balance.btc -= cost;
    this.balance[this.sndCurr] += qty


    console.log(`Buy ${qty}(${confidence})  @ ${price} (${moment.unix(ts).format()}) = -${cost} btc`, this.balance)
    // console.log('\n')
    // this.updateBalanceList();

  }
  calculateOrders(price){
    _.each(this.orders, function (el,i) {
      el.profit =   el.cost - price*el.qty;
    })
  }
  sell(price, confidence,ts){
    if(this.orders.length>0 && this.orders[this.orders.length-1].type==='sell') return ;
    // let percent = (2+Math.sqrt(Math.abs(confidence))) / 100 ; //1% of balance per orders
    let percent = ((5-Math.abs(confidence))) / 100 ; //1% of balance per orders
    let qty =  (this.balance[this.sndCurr]>0)? this.balance[this.sndCurr]*percent : 0;

    let cost = qty * price;
    this.orders.push({
      type:'sell',
      price:price,
      qty:qty,
      cost:cost
    })
    this.balance.btc += cost;
    this.balance[this.sndCurr] -= qty
    console.log(`Sell ${qty}(${confidence})  @ ${price} (${moment.unix(ts).format()}) = -${cost} ${this.sndCurr}`, this.balance)
    // console.log(this.balance)
    // console.log('\n')
    // this.updateBalanceList();

  }
  sellAll(price){
    let qty = this.balance[this.sndCurr];
    let cost = qty * price;
    this.orders.push({
      type:'sell',
      price:price,
      qty:qty,
      cost:cost
    })
    this.balance.btc += cost;
    this.balance[this.sndCurr] -= qty
    console.log(`Sell all ${qty} @ ${price} = +${cost} btc `)
    console.log(this.balance)
    console.log('\n')
    // this.updateBalanceList();

  }
  updateBalanceList(price){
    let balance = this.balance;
    let self = this;

    let balObj = {
      btc:balance.btc,
      period:self.activePeriod,
      eqv:{
        btc:balance.btc+(balance[this.sndCurr]*price)
      }
    };
    balObj[this.sndCurr] = balance[this.sndCurr];
    balObj.eqv[this.sndCurr] = balance[this.sndCurr]+(balance.btc/price);

    this.balanceList.push(balObj)
  }
  getBalance(price){
    return this.balance.btc + this.balance[this.sndCurr]*price
  }

}
module.exports = Wallet;