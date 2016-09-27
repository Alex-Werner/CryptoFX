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
    getDatabase: function () {
        return MIB.database;
    },
    getDatabaseSize: function () {
        return objectHelper.formatByteSize(objectHelper.sizeof(MIB.database), true);
    },
    createExchange: function (exchangeName) {
        var exchange = {
            exchange: exchangeName,
            markets: {}
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
        
        cl('Created market', marketName, 'of', exchangeName);
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
    addToMarket:function(exchangeName, marketName, lastObj, historyObj){
        var hasExchange = MIB.isExchangeExist(exchangeName);
        if (!hasExchange) {
            return false;
        }
        var hasMarket = MIB.isMarketExist(exchangeName, marketName);
        if (!hasMarket) {
            return false;
        }
        
        MIB.database[exchangeName].markets[marketName].last = lastObj;
        MIB.database[exchangeName].markets[marketName].history.push(historyObj);
        return true;
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
        var now = moment().valueOf();
        var lastObj = {
            price: last,
            timestamp: now
        };
        var historyObj = {
            last: last,
            bid: bid,
            ask: ask,
            timestamp: now
        };
        MIB.addToMarket(exchangeName, marketName, lastObj, historyObj);
        
    },
    getListAll: function () {
        // cl(MIB.database);
        var list = {};
        for (var exchange in MIB.database) {
            list[exchange] = [];
            for (var market in MIB.database[exchange].markets) {
                list[exchange].push(market);
            }
        }
        return list;
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