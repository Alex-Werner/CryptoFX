var objectHelper = require('../helpers/objectHelper.js');
var moment = require('moment');
/**
 * Used to manage the population of MIB (Manager d'information brutes -> Raw information manager)
 *
 */
const MIB = {
    database: {
        // bittrex:{
        //     exchange:'bittrex',
        //     markets:[]
        // }
    },
    displayDatabase: function () {
        cl(MIB.database);
    },
    getDatabaseSize: function () {
        return objectHelper.formatByteSize(objectHelper.sizeof(MIB.database), true);
    },
    createExchange: function (exchangeName) {
        var exchange = {
            exchange: exchangeName,
            markets: []
        };
        MIB.database[exchangeName] = exchange;
        cl('Created exchange', exchangeName);
    },
    getExchange: function (exchangeName) {
        var hasExchange = MIB.database.hasOwnProperty(exchangeName);
        if (!hasExchange) {
            return false;
        }
        return MIB.database[exchangeName];
    },
    isExchangeExist: function (exchangeName) {
        if (!MIB.getExchange(exchangeName)) {
            return false;
        }
        return true;
    },
    createMarket: function (exchangeName, marketName) {
        var market = {
            "exchange": exchangeName,
            "marketName": marketName,
            "lastPrice": {},
            "history": []
        };
        if (!MIB.isExchangeExist(exchangeName)) {
            MIB.createExchange(exchangeName);
        }
        var exchange = MIB.getExchange(exchangeName);
        exchange.markets[marketName] = market;
        // MIB.createMarket(exchangeName, marketName);
        
        cl('Try to create market', marketName, 'of', exchangeName);
    },
    getMarket: function (exchangeName, marketName) {
        var hasExchange = MIB.database.hasOwnProperty(exchangeName);
        if (!hasExchange) {
            return false;
        }
        var exchange = MIB.getExchange(exchangeName);
        var hasMarket = exchange.markets.hasOwnProperty(marketName);
        if (!hasMarket) {
            return false;
        }
        return exchange.markets[marketName];
    },
    isMarketExist: function (exchange, pair) {
        if (!MIB.getMarket(exchange, pair)) {
            return false;
        }
        return true;
    },
    // populate:function(pair, exchange, last, bid, ask){
    populate: function (type, data) {
        var exchangeName = data.exchange;
        var marketName = data.pair;
        var last = data.last;
        var bid = data.bid;
        var ask = data.ask;
        
        if (!MIB.isMarketExist(exchangeName, marketName)) {
            MIB.createMarket(exchangeName, marketName)
        }
        var market = MIB.getMarket(exchangeName, marketName);
        var now = moment().valueOf();
        market.last = {
            price: last,
            timestamp: now
        };
        market.history.push({
            last: last,
            bid: bid,
            ask: ask,
            timestamp: now
        })
        
    },
    getLastPrice: function (exchangeName, marketName, giveTime) {
        if (!MIB.isMarketExist(exchangeName, marketName)) {
            MIB.createMarket(exchangeName, marketName)
        }
        var market = MIB.getMarket(exchangeName, marketName);
        if (market) {
            if (market.last) {
                var lastPrice = market.last.price;
                var lastTime = market.last.timestamp;
                if (!giveTime) {
                    return lastPrice;
                }
                return {
                    marketName: marketName,
                    price: lastPrice,
                    time: moment(lastTime).format("YYYY-MM-DD HH:mm:ss")
                };
            }
            return null;
            
        }
        return null;
        
        
    }
};
module.exports = MIB;