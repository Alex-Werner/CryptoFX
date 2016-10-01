var moment = require('moment');

var config = {
    timeframes: [
        //If our tick are too big to fulfill less than 1mn
        //Eg : Each tick are separed by 1m, but we ask 20s, what do we do ?
        //For now, just comment them
        {name: '20s', margin: 20000},
        {name: '40s', margin: 40000},
        {name: '1m', margin: 60000},
        {name: '2m', margin: 2 * 60 * 1000},
        {name: '5m', margin: 5 * 60 * 1000},
        {name: '15m', margin: 15 * 60 * 1000},
        {name: '30m', margin: 30 * 60 * 1000},
        {name: '1h', margin: 1 * 60 * 60 * 1000},
        {name: '2h', margin: 2 * 60 * 60 * 1000},
        {name: '3h', margin: 3 * 60 * 60 * 1000},
        {name: '4h', margin: 4 * 60 * 60 * 1000},
        {name: '6h', margin: 6 * 60 * 60 * 1000},
        {name: '8h', margin: 8 * 60 * 60 * 1000},
        {name: '1d', margin: 24 * 60 * 60 * 1000},
        {name: '1w', margin: 7 * 24 * 60 * 60 * 1000}],
};

const MAB = {
    database: {
        initiated: false
    },
    createExchange: function (exchangeName) {
        MAB.database[exchangeName] = {
            exchangeName: exchangeName,
            markets: {}
        };
        cl("Created exchange " + exchangeName);
    },
    createMarket: function (exchangeName, marketName) {
        var market = {
            marketName: marketName,
            history: {}
        };
        for (var index in config.timeframes) {
            var tf = config.timeframes[index].name;
            market.history[tf] = {};
        }
        MAB.database[exchangeName].markets[marketName] = market;
        cl("Created market " + marketName);
    },
    createCandle: function (ticks, timeframe) {
        var candle = {
            timeFrame: timeframe.name,
            open: 0,
            close: 0,
            mid: 0,
            bid: 0,
            ask: 0,
            last: 0,
            low: 0,
            high: 0,
            volume: 0,
            BTCVol:0,
            timestamp: 0,
            techIndic: {
                volatility: 0,
                change: 0,
                gain: 0,
                loss: 0,
                avg_gain: 0,
                avg_loss: 0,
                rs: 0,
                rsi: 0,
                true_range: 0,
                avg_true_range: 0,
                twelves_days_ema: 0,
                twenty_six_days_ema: 0,
                macd: 0,
                signal: 0,
                histogram: 0
            }
        };
        var processedTicks = 0;
        var startBTCVol = 0;
        var endBTCVol=0;
        for (_tickIndex in ticks) {
            var _tick = ticks[_tickIndex];
            if(startBTCVol==0){startBTCVol=_tick.BTCVol;}
            if (processedTicks == 0) {
                candle.open = _tick.last;
                candle.low = parseFloat(_tick.bid);
            }
            candle.mid += parseFloat(parseFloat(_tick.bid)+parseFloat(_tick.ask - _tick.bid) / 2);
            candle.bid += parseFloat(_tick.bid);
            candle.ask += parseFloat(_tick.ask);
            candle.last = parseFloat(_tick.last);
            
            if (candle.high < _tick.ask) {
                candle.high = _tick.ask
            }
            if (candle.high < _tick.last) {
                candle.high = _tick.last
            }
            if (candle.low > _tick.low) {
                candle.low = _tick.low
            }
            if (candle.low > _tick.last) {
                candle.low = _tick.last
            }
            if(_tick.hasOwnProperty('BTCVol')){
    
                endBTCVol = ((startBTCVol-_tick.BTCVol)>endBTCVol) ? startBTCVol-_tick.BTCVol : endBTCVol;
                candle.BTCVol = endBTCVol;
            }
            if (!_tick.hasOwnProperty('volume')) {
                candle.volume = -1;
            };
            candle.timestamp = _tick.timestamp;
            processedTicks++;
        }
        candle.mid = candle.mid / processedTicks;
        candle.bid = candle.bid / processedTicks;
        candle.ask = candle.ask / processedTicks;
        candle.formatedTime=moment(candle.timestamp).format('YYYY-MM-DD HH:mm:ss');
        candle.close = _tick.last;
        
        return candle;
        
    },
    initDatabaseFromList: function (list) {
        if (!MAB.database.initiated) {
            for (var exchange in list) {
                MAB.createExchange(exchange)
                for (var market in list[exchange].markets) {
                    MAB.createMarket(exchange, market);
                }
            }
            MAB.database.initiated = true;
            MAB.database.lastSync = moment().valueOf();
        }
        for (var exchange in list) {
            for (var market in list[exchange].markets) {
                // for(var indexTick in list[exchange].markets[market].history){
                //     var tick = list[exchange].markets[market].history[indexTick];
                //     cl(tick);
                // }
                MAB.populateDatabaseFromTick(exchange, market, list[exchange].markets[market].history);
            }
        }
        return true;
    },
    populateDatabaseFromTick: function (exchange, market, tickHistory) {
        var addCandle = function (exchange, market, timeframe, candle) {
            MAB.database[exchange].markets[market].history[timeframe.name][candle.timestamp] = candle;
            // MAB.database[exchange].markets[market].history[timeframe.name].push(candle);
        };
        for (var index in config.timeframes) {
            var tf = config.timeframes[index].name;
            //If our tick are too big to fulfill less than 1mn
            //Eg : Each tick are separed by 1m, but we ask 20s, what do we do ?
            // if(tf=="1m"){
            var timestampCount = 0;
            var nb = 0;
            var lastTimestamp = 0;
            var tickAccumulator = [];
            
            for (var _tickIndex in tickHistory) {
                var _tick = tickHistory[_tickIndex];
                if (lastTimestamp == 0 && _tickIndex == 0) {
                    lastTimestamp = _tick.timestamp;
                } else {
                    timestampCount = timestampCount + (_tick.timestamp - lastTimestamp);
                    nb++;
                    lastTimestamp = _tick.timestamp;
                    tickAccumulator.push(_tick);
                    if (timestampCount >= (config.timeframes[index].margin) * 0.05) {
                        var relativeMarginTime = timestampCount / config.timeframes[index].margin;
                        if (relativeMarginTime >= 0.95 && relativeMarginTime <= 1.1) {
                            var candle = MAB.createCandle(tickAccumulator, config.timeframes[index]);
                            addCandle(exchange, market, config.timeframes[index], candle);
                            
                            tickAccumulator = [], timestampCount = 0;
                            nb = 0;
                        }
                    }
                }
            }
            // var tickReadyToBeCandelized = {};
            // MAB.createCandle(tickToCandelize,"1m")         
            // return;
            // }
        }
        // cl(tickHistory);
    },
    performCalculation:function () {
        for(var exchangeName in MAB.database){
            if(exchangeName=="initiated" || exchangeName=="lastSync"){
                
            }else{
                var exchange = MAB.database[exchangeName];
                for(var marketName in exchange.markets){
                    var market = exchange.markets[marketName];
                    for(var timeframeName in market.history){
                        var timeframe = market.history[timeframeName]
                        
                        cl(timeframeName, Object.keys(timeframe).length);
                        for(var i =0; i<Object.keys(timeframe).length; i++){
                            var tickName = Object.keys(timeframe)[i];
                            var lastName = Object.keys(timeframe)[i-1] || tickName;
                            
                            var tick = timeframe[tickName];
                            var lastTick = timeframe[lastName];
                            // cl(tick.last, timeframe[Object.keys(timeframe)[i-1]])
                            tick.techIndic.change= tick.last - lastTick.last;
                        }
                    }
                }
            }
        }
        cl(MAB.database['poloniex'].markets['BTC_XMR'].history['5m']);
    }
};
module.exports = MAB;