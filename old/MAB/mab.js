var moment = require('moment');
Object.entries = require('object.entries');
var _ = require('lodash');
const Indicators = require('../helpers/indicators.js');

var config = {
    timeframes: [
        //If our tick are too big to fulfill less than 1mn
        //Eg : Each tick are separed by 1m, but we ask 20s, what do we do ?
        //For now, just comment them
        // {name: '20s', margin: 20000},
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
        {name: '1w', margin: 7 * 24 * 60 * 60 * 1000}
    ],
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
            BTCVol: 0,
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
        var endBTCVol = 0;
        for (_tickIndex in ticks) {
            var _tick = ticks[_tickIndex];
            if (startBTCVol == 0) {
                startBTCVol = _tick.BTCVol;
            }
            if (processedTicks == 0) {
                candle.open = _tick.last;
                candle.low = parseFloat(_tick.bid);
            }
            candle.mid += parseFloat(parseFloat(_tick.bid) + parseFloat(_tick.ask - _tick.bid) / 2);
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
            if (_tick.hasOwnProperty('BTCVol')) {
                
                endBTCVol = ((startBTCVol - _tick.BTCVol) > endBTCVol) ? startBTCVol - _tick.BTCVol : endBTCVol;
                candle.BTCVol = endBTCVol;
            }
            if (!_tick.hasOwnProperty('volume')) {
                candle.volume = -1;
            }
            ;
            candle.timestamp = _tick.timestamp;
            processedTicks++;
        }
        candle.mid = candle.mid / processedTicks;
        candle.bid = candle.bid / processedTicks;
        candle.ask = candle.ask / processedTicks;
        candle.formatedTime = moment(candle.timestamp).format('YYYY-MM-DD HH:mm:ss');
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
    performCalculation: function () {
        
        var prepareValuesForCalculation = function (period, list, actualIndexInList) {
            
            var listArr = Object.entries(list);
            var maxIndex = listArr.length - 1;
            var tickArr = [];
            var values = [];
            if(actualIndexInList){
                if((actualIndexInList-period)>=0){
                    tickArr = Object.entries(list).slice(actualIndexInList-period, actualIndexInList);
                }else{
                    tickArr = Object.entries(list).slice(0, actualIndexInList);
                }
            }else{
                tickArr = Object.entries(list).slice(maxIndex - (period), maxIndex);
            }
            tickArr.filter(function (tick) {
                values.push(tick[1].close);
            });
            return values;
            
        };
        
        for (var exchangeName in MAB.database) {
            if (exchangeName == "initiated" || exchangeName == "lastSync") {
                
            } else {
                var exchange = MAB.database[exchangeName];
                for (var marketName in exchange.markets) {
                    var market = exchange.markets[marketName];
                    for (var i = 0; i < Object.keys(market.history).length; i++) {
                        
                        var timeframeName = Object.keys(market.history)[i];
                        var timeframe = market.history[timeframeName]
                        
                        cl("New ", marketName, "Timeframe", timeframeName, Object.keys(timeframe).length);
                        
                        var lastTick = null, tick = null;
                        
                        for (var tickIndex = 0; tickIndex < Object.keys(timeframe).length; tickIndex++) {
                            var tickList = timeframe;
                            var tickName = Object.keys(timeframe)[tickIndex];
                            tick = tickList[tickName];
                            
                            var lastNtickName = function (n) {
                                return Object.keys(timeframe)[tickIndex - n];
                            }
                            var lastName = lastNtickName(1) || tickName;
                            var lastTick = tickList[lastName];
                            
                            var calculateTechIndic = function () {
                                tick.techIndic.change = tick.last - lastTick.last;
    
                                tick.techIndic.sma = {};
                                tick.techIndic.sma[10] = Indicators.SMA.calculate({
                                    period: 10,
                                    values: prepareValuesForCalculation(10, tickList, tickIndex)
                                });
                                tick.techIndic.sma[20] = Indicators.SMA.calculate({
                                    period: 20,
                                    values: prepareValuesForCalculation(20, tickList, tickIndex)
                                });
                                tick.techIndic.sma[50] = Indicators.SMA.calculate({
                                    period: 50,
                                    values: prepareValuesForCalculation(50, tickList, tickIndex)
                                });
                                tick.techIndic.sma[100] = Indicators.SMA.calculate({
                                    period: 100,
                                    values: prepareValuesForCalculation(100, tickList, tickIndex)
                                });
                                tick.techIndic.sma[200] = Indicators.SMA.calculate({
                                    period: 200,
                                    values: prepareValuesForCalculation(200, tickList, tickIndex)
                                });
                                tick.techIndic.sma['bullBurst'] = false;
                                tick.techIndic.sma['bearBurst'] = false;
    
                                if (tickIndex == 200 + 1) {
                                    if (tick.techIndic.sma[50] > tick.techIndic.sma[200]) {
                                        if (tickList[lastNtickName(1)].techIndic.sma[50] == tickList[lastNtickName(1)].techIndic.sma[200]) {
                                            if (tickList[lastNtickName(2)].techIndic.sma[50] < tickList[lastNtickName(2)].techIndic.sma[200]) {
                                                tick.techIndic.sma['bullBurst'] = true;
                                            }
                                        }
                                        if (tickList[lastNtickName(1)].techIndic.sma[50] < tickList[lastNtickName(1)].techIndic.sma[200]) {
                                            tick.techIndic.sma['bullBurst'] = true;
                                        }
                                    }
                                    if (tick.techIndic.sma[50] < tick.techIndic.sma[200]) {
                                        if (tickList[lastNtickName(1)].techIndic.sma[50] == tickList[lastNtickName(1)].techIndic.sma[200]) {
                                            if (tickList[lastNtickName(2)].techIndic.sma[50] > tickList[lastNtickName(2)].techIndic.sma[200]) {
                                                tick.techIndic.sma['bearBurst'] = true;
                                            }
                                        }
                                        if (tickList[lastNtickName(1)].techIndic.sma[50] > tickList[lastNtickName(1)].techIndic.sma[200]) {
                                            tick.techIndic.sma['bullBurst'] = true;
                                        }
            
                                    }
        
                                }
                                if(tick.techIndic.sma['bullBurst'] || tick.techIndic.sma['bearBurst']){
                                    cl("OUIIII!!");
                                    cl(tick, lastTick);
                                }
    
    
                                tick.techIndic.tsi = Indicators.TSI.calculate({
                                    longPeriod: 25,
                                    shortPeriod:13,
                                    values: prepareValuesForCalculation(50, tickList, tickIndex)
                                });
    
                                tick.techIndic.ema = {};
                                tick.techIndic.ema[27] = Indicators.EMA.calculate({
                                    period: 27,
                                    values: prepareValuesForCalculation(28, tickList, tickIndex)
                                });
                            };
                            calculateMarketSignals = function () {
    
                                tick.marketSignals = {};
                                tick.marketSignals.largeGoldenCross = (tick.techIndic.sma['bullBurst']);
                                tick.marketSignals.largeDeathCross = (tick.techIndic.sma['bearBurst']);
    
                            };
                            calculateTechIndic();
                            calculateMarketSignals();                                        
                            
                            // var calculIndicatorWithSpecificLastTicksLength = function(maxLastTicksLength, actualLastTickLength,tickIndex, indicator){
                            //     var handledIndicator = ['sma','priceChange'];
                            //     if(maxLastTicksLength!='undefined'){
                            //         if(handledIndicator.indexOf(indicator)>-1){
                            //             if(lastTicksLength>maxLastTicksLength && tickIndex>maxLastTicksLength){
                            //                 switch (indicator){
                            //                     case "sma":
                            //                         var sma=0;
                            //                         for(var k = 1;k<=maxLastTicksLength; k++){
                            //                             sma+=parseFloat(timeframe[Object.keys(timeframe)[tickIndex-k]].last);
                            //                         }
                            //                         sma = sma/maxLastTicksLength;
                            //                         return sma;
                            //                         break;
                            //                     case "priceChange":
                            //                         var pc = (tick.last-lastTick.last);
                            //                         return pc;
                            //                     case "doubleSmoothedAbsolutePC":
                            //                         var dsaPC = 1;
                            //                         return dsaPC;
                            //                         break;
                            //                     case "doubleSmoothedPC":
                            //                         var dsPC = 1;
                            //                         return dsPC;
                            //                         break;
                            //                     case "tsi":
                            //                         return tsi = 100 * (tick.techIndic.doubleSmoothedPC/tick.techIndic.doubleSmoothedAbsolutePC);
                            //                         return tsi;
                            //                         break;
                            //                     default:
                            //                         return null;
                            //                     break;
                            //                 }
                            //             }return null;
                            //         }return null;
                            //     }
                            //     return null;
                            // };
                            
                            
                            // var tickArr = Object.entries(ticks).slice(0, period+1);
                            // cl("Tick arr is ", tickArr.length);
                            // var values = [];
                            // var x = tickArr.filter(function(tick){
                            //     values.push(tick[1].close);
                            //     return values;
                            // });
                            // cl(x);
                            // tick.techIndic.ema[27]= Indicators.EMA.calculate({period:27, values:values});
                            //
                            // tick.techIndic.sma[10] = calculIndicatorWithSpecificLastTicksLength(10,lastTicksLength,tickIndex, 'sma');
                            // tick.techIndic.sma[20] = calculIndicatorWithSpecificLastTicksLength(20,lastTicksLength,tickIndex, 'sma');
                            // tick.techIndic.sma[50] = calculIndicatorWithSpecificLastTicksLength(50,lastTicksLength,tickIndex, 'sma');
                            // tick.techIndic.sma[100] = calculIndicatorWithSpecificLastTicksLength(100,lastTicksLength,tickIndex, 'sma');
                            // tick.techIndic.sma[200] = calculIndicatorWithSpecificLastTicksLength(200,lastTicksLength,tickIndex, 'sma');
                            //
                            // if(lastTicksLength>200){
                            //     tick.techIndic.sma["200_50"]=(tick.techIndic.sma[50]/tick.techIndic.sma[200]);
                            //     tick.techIndic.sma["bullBurst"]=(tick.techIndic.sma[50]/sma>1)? -1: 1;
                            // }
                            // tick.techIndic.priceChange = calculIndicatorWithSpecificLastTicksLength(2, lastTicksLength, tickIndex, 'priceChange');
                            //
                            // tick.techIndic.doubleSmoothedPC = calculIndicatorWithSpecificLastTicksLength(25, lastTicksLength, tickIndex, 'doubleSmoothedPC');
                            // tick.techIndic.doubleSmoothedAbsolutePC = calculIndicatorWithSpecificLastTicksLength(25, lastTicksLength, tickIndex, 'doubleSmoothedAbsolutePC');
                            // tick.techIndic.tsi = calculIndicatorWithSpecificLastTicksLength(25, lastTicksLength, tickIndex, 'tsi');
                            //
                            // tick.marketSignals = {
                            //     largeDeathCross:false,
                            //     largeGoldenCross:false
                            // };
                            
                            //FIXME : This is currently bugged.
                            //GoldenCross is triggered but when DeathCross should, Golden is trigered again.
                            // if(lastTick.techIndic.sma["bullBurst"]!=tick.techIndic.sma["bullBurst"]){
                            //     if(tick.techIndic.sma["bullBurst"]==-1){
                            //         tick.marketSignals.largeGoldenCross = true;
                            //     }
                            //     if(tick.techIndic.sma["bullBurst"]==1){
                            //         tick.marketSignals.largeDeathCross = true;
                            //
                            //     }
                            // }
                            //                          
                            // tick.techIndic.change= tick.last - lastTick.last;
                        }
                    }
                }
            }
        }
        
        // var h = MAB.database['poloniex'].markets['BTC_XMR'].history['20s'];
        // for(var i = 200; i<Object.keys(h).length; i++){
        //     cl(h[Object.keys(h)[i]]);
        // }
        var display = MAB.database['poloniex'].markets['BTC_XMR'].history['40s'];
        var last = display[Object.keys(display)[Object.keys(display).length - 1]];
        var lastN1 = display[Object.keys(display)[Object.keys(display).length - 2]];
        var lastN2 = display[Object.keys(display)[Object.keys(display).length - 3]];
        cl(last);
        // cl(lastN1);
        // cl(lastN2);
    }
};
module.exports = MAB;