const _ = require('lodash')
const Timeframe = require('../libs/timeframe');
const Order = require('./Order');

class Trader {
  constructor(settings) {

    let self = this;
    this.activePeriod = 0;
    this.balanceHistory = [];
    this.backTestMode = false;
    this.portfolio = {
      exchanges: {}
    }
    this.orderNb=0;
    this.exchanges = {}
    this.oldBalance = {}


    this.use = self.subscribeToItem.bind(self);

    this.orders = {
      create: self.createOrder.bind(self)
    }
    this.balance = {
      add: self.addToBalance.bind(self),
      remove: self.removeFromBalance.bind(self),
      get: self.getBalance.bind(self)
    }
    this.candles = {
      addMany: self.addManyCandles.bind(self),
      add: self.addOneCandle.bind(self),
    }
  }


  addOneCandle(settings) {
    let candle = settings.candle;
    let exchange = settings.exchange;
    let market = settings.market;

    this.ensureExchange(exchange);
    this.ensureMarket(exchange, market);

    if (!this.getCandle({timestamp: candle.timestamp})) {
      // console.log( settings.market, market)

      // console.log(this.exchanges[exchange].markets, settings)
      let mkt = this.exchanges[exchange].markets[market];
      mkt.candles[candle.timeframe.name].push(candle)
    }
  }

  getCandle() {
    return false;
  }

  addManyCandles(settings) {
    //We want to check if they are contiguous
    let candles = settings.candles;
    let exchange = settings.exchange;
    let market = settings.market;
    let self = this;

    _.each(candles, function (candle, i) {
      self.addOneCandle({candle, exchange, market})
    })

    /*let firstCandle = candles[0];
    let lastFullCandle = candles[candles.length-1];//todo : Check if the last one is full...

    let sameMargin = (firstCandle.timeframe.margin === lastFullCandle.timeframe.margin);
    let diff = lastFullCandle.timestamp -  firstCandle.timestamp ;
    let sumAddsUp = ((candles.length-1)*lastFullCandle.timeframe.margin)===diff;
    let contiguous = ( sameMargin && sumAddsUp);

    if(this.contiguous){

    }
    */
  }

  subscribeToItem(type, name) {

  }

  runBacktest(settings, conditionalCallback, resultCallback) {
    this.backTestMode = true;
    let startingCandle = settings.startingCandle || 0;
    let market = settings.market || (() => {
      throw new Error('Missing market')
    })()
    let periodLimit = settings.periodLimit || 10000;
    let exchange = settings.exchange || (() => {
      throw new Error('Missing exchange')
    })()
    let timeframe = settings.timeframe || (() => {
      throw new Error('Missing timeframe')
    })()

    let candles = _.has(this.exchanges, `${exchange}.markets.${market}.candles.${timeframe}`) ? this.exchanges[exchange].markets[market].candles[timeframe] : (() => {
      throw new Error('Missing candles')
    })()

    let self = this;
    let close = 0
    _.each(candles, function (el, i) {

      if (el.timestamp >= startingCandle) {
        self.activePeriod++;

        _.each(self.exchanges, function (ex) {
          let ordersToArchive = [];
          _.each(self.exchanges[ex.name].orders, function (odr, i) {

            let profit = odr.consider(el)
            let tradingCur = odr.market.split('-')[0];
            let baseCur = odr.market.split('-')[1];

            if (profit !== null) {
              self.removeFromBalance({
                exchange: settings.exchange,
                currency: tradingCur,
                sum: profit
              })
              self.addToBalance({
                exchange: settings.exchange,
                currency: baseCur,
                sum: profit
              })
              ordersToArchive.push(i);
            }
          });

          self.exchanges[ex.name].orders = self.exchanges[ex.name].orders.filter(function (el, i) {
            return ordersToArchive.indexOf(i) === -1
          })
        })

        if (conditionalCallback(el, i))
          resultCallback(el, i);
        self.balanceHistory.push((self.exchanges[exchange].balance.btc.available + (self.exchanges[exchange].balance.dash.available * el.close)))

      }

    })
  }

  ensureExchange(exchange) {
    let self = this;
    if (!_.has(self.exchanges, exchange)) {
      self.exchanges[exchange] = {
        name: exchange,
        balance: {},
        orders: [],
        markets: {}

      }
    }
  }

  ensureMarket(exchange, market) {
    let self = this;
    if (!_.has(self.exchanges[exchange].markets, market)) {

      self.exchanges[exchange].markets[market] = {
        candles: {
          '1d': []
        },

      };
    }
  }

  createOrder(settings) {
    let self = this;
    // console.log(settings.tp.length)
    if(settings.tp.length>1){
      _.each(settings.tp, function (el) {

        let subSettings = _.clone(settings);
        subSettings.tp = el.price;
        subSettings.qty = (settings.qty* el.qtyPercent /100);
        settings.qty = settings.qty - subSettings.qty;
        // console.log(subSettings)

        let order = self.createOrder(subSettings)
      })
    }else{
      let order = new Order(settings)
      console.log(order)

      this.orderNb++;
      let qty = settings.qty;
      let price = settings.price;
      let tradingCur = order.market.split('-')[0];
      let baseCur = order.market.split('-')[1];

      this.exchanges[settings.exchange].orders.push(order)

      this.removeFromBalance({
        exchange: settings.exchange,
        currency: (order.direction === 'buy') ? baseCur : tradingCur,
        sum: (order.direction === 'buy') ? order.cost : order.qty
      })

      this.addToBalance({
        exchange: settings.exchange,
        currency: (order.direction === 'buy') ? tradingCur : baseCur,
        sum: (order.direction === 'buy') ? order.qty : order.cost
      })
    }


  }

  addToBalance(opts) {
    let exchange = opts.exchange;
    let currency = opts.currency.toLowerCase();
    let sum = opts.sum;

    let self = this;

    if (!_.has(self.exchanges[exchange].balance, currency)) self.exchanges[exchange].balance[currency] = {available: 0}
    this.exchanges[exchange].balance[currency].available += sum;
    if (!_.has(this.oldBalance, currency)) this.oldBalance[currency] = this.exchanges[exchange].balance[currency].available;


  }

  removeFromBalance(opts) {
    let exchange = opts.exchange;
    let currency = opts.currency.toLowerCase();
    let sum = opts.sum;

    let self = this;

    if (!_.has(self.exchanges, exchange)) self.exchanges[exchange] = {}
    if (!_.has(self.exchanges[exchange].balance, currency)) self.exchanges[exchange].balance[currency] = {available: 0}
    this.exchanges[exchange].balance[currency].available -= sum;
  }

  getBalance(settings) {
    let exchange = settings.exchange
    let currency = settings.currency.toLowerCase();

    // console.log(this.exchanges.bittrex.balance[currency])
    return this.exchanges[exchange].balance[currency].available
  }


}

module.exports = Trader;