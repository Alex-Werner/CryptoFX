Object.entries = require('object.entries');
var _ = require('lodash');


var Indicators = {
    average: {
        calculate: function (options) {
            var average = 0;
            var total = 0;
            if (options && options.hasOwnProperty('values')) {
                var values = options.values;
                values.forEach(function (val) {
                    total += parseFloat(val);
                });
                average = total / values.length;
                // _.each(ticks,function(tick, index){
                //     total+=tick.close;
                // });
                // cl(Object.keys(ticks).length);
                // average = total/Object.keys(ticks).length+1;
                return average;
            }
            return null;
        }
    },
    avgGain: function (options) {
        if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
            return null;
        }else {
            return null;
        }
    },
    avgLosses: function (options) {
        if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
            return null;
        }else {
            return null;
        }
    },
    priceChange: function (options) {
        if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
            return null;
        }else {
            return null;
        }
    },
    //Simple moving average
    SMA: {
        calculate: function (options) {
            if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
                var period = options.period;
                var values = options.values;
                var sma = 0;
                if(values.length!==period){
                    return null;
                };
                _.each(values, function (val, index) {
                    sma+=parseFloat(val);
                });
                sma = sma/period;
            }
            return sma;
        }
    },
    //Exponential Moving Average
    EMA: {
        calculate: function (options) {
            if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
                var period = options.period;
                var values = options.values;
                var ema = 0;
                
                if(values.length<period){
                  return null;  
                };
                _.each(values, function (val, index) {
                    if (index + 1 == period) {
                        ema = Indicators.average.calculate({values: values.slice(0, period)});
                        ema = Number.parseFloat(ema.toFixed(8));
    
                    } else if (index + 1 > period) {
                        var a = (2 / (period + 1));
                        var b = (1 - (2 / (period + 1)));
                        
                        ema = (val * a) + (ema * b);
                        ema = Number.parseFloat(ema.toFixed(8));
                    }
                });
                return ema;
            } else {
                return null;    
            }
        }
    },
    //Weighted Moving Average
    WMA: {
        calculate: function (options) {
            if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
                return null;
            }else {
                return null;
            }
        }
    },
    //Moving Average Convergence Divergence
    MACD: {
        calculate: function (options) {
            if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
                return null;
            }else {
                return null;
            }
        }
    },
    //Bollinger Bands
    BB: {
        calculate: function (options) {
            if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
                return null;
            }else {
                return null;
            }
        }
    },
    //Average true range
    ATR: {
        calculate: function (options) {
            if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
                return null;
            }else {
                return null;
            }
        }
    },
    //Relative Strength Index
    RSI: {
        calculate: function (options) {
            if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
                return null;
            }else {
                return null;
            }
        }
    },
    //True Strength Index
    TSI: {
        calculate: function (options) {
            if (options && options.hasOwnProperty('longPeriod') && options.hasOwnProperty('shortPeriod') && options.hasOwnProperty('values')) {
                //Should be values of close price
                var shortPeriod = options.shortPeriod;
                var longPeriod = options.longPeriod;
                var values = options.values;
                var TSI = 0;
                
                
                if(values.length>longPeriod+shortPeriod){
                    var FSArr = [];
                    var FSAbsArr = [];
                    _.each(values, function (val, index) {
                        if(values.length>(index+longPeriod)){
                            var lastLongPeriodValues = values.slice(index,index+longPeriod);
                            var PCArr = Indicators.misc.getLastNPriceChange(longPeriod, lastLongPeriodValues);
                            var PCAbsArr = Indicators.misc.getLastAbsNPriceChange(longPeriod, lastLongPeriodValues);
                            
                            var firstSmooth = Indicators.EMA.calculate({period:longPeriod, values:PCArr});
                            var firstAbsSmooth = Indicators.EMA.calculate({period:longPeriod, values:PCAbsArr});
                            FSArr.push(firstSmooth);
                            FSAbsArr.push(firstAbsSmooth);
                            
                            if(FSArr.length>=shortPeriod && (FSAbsArr.length>=shortPeriod)){
                                var secondSmooth = Indicators.EMA.calculate({period:shortPeriod, values:FSArr});
                                var secondAbsSmooth = Indicators.EMA.calculate({period:shortPeriod, values:FSAbsArr});
                                
                                var DoubleSmoothPC = parseFloat(secondSmooth);
                                var DoubleAbsSmoothPC = parseFloat(secondAbsSmooth);
                                
                                TSI = 100 * parseFloat(DoubleSmoothPC/DoubleAbsSmoothPC);
                            }
    
                        }
                    });                   
                }
                return TSI;
                
            }else {
                return null;
            }
        }
    },
    misc:{
        getLastNPriceChange:function(n, values){
          var PCArr = [];
            _.each(values,function(val, index){
                if(index==0){
                    PCArr.push(0);
                }else{
                    PCArr.push(val-values[index-1]);
                }
            });
            return PCArr;
            
        },
        getLastAbsNPriceChange:function(n, values){
            var PCArr = [];
            _.each(values,function(val, index){
                if(index==0){
                    PCArr.push(0);
                }else{
                    PCArr.push(Math.abs(val-values[index-1]));
                }
            });
            return PCArr;
        
        },
        smoothedPriceChange:function(period, PCarr){
            return Indicators.EMA.calculate({period:period, values:PCarr});
        },
        
        doubleSmoothedPriceChange:{
            calculate: function (options) {
                if (options && options.hasOwnProperty('longPeriod') && options.hasOwnProperty('shortPeriod') && options.hasOwnProperty('values')) {
                    // var period = options.period;
                    // var values = options.values;
                    // if(values.length!==period){
                    //     return null;
                    // };
                    //
                    //
                    // var PCArr = Indicators.misc.getLastNPriceChange(25, values);
                    //
                    // var firstSmooth = Indicators.misc.getLastNPriceChange(25, PCArr);
                    // var firstSmooth = Indicators.EMA.calculate({period:25, values:PCArr});
                    // var doubleSmooth = Indicators.EMA.calculate({period:13, values:PCArr});
                    // cl(firstSmooth, "");
    
                    // cl(values.length);
                    
                    // var PC = values[values.length-1]-values[values.length-2];
                    // var firstSmooth = Indicators.EMA.calculate({period:25, values:values});
                    // cl(firstSmooth, secondSmooth);
                    return null;
                }else {
                    return null;
                }
            }
        },
        doubleSmoothedAbsolutePriceChange:{
            calculate: function (options) {
                // if (options && options.hasOwnProperty('period') && options.hasOwnProperty('values')) {
                //     var period = options.period;
                //     var values = options.values;
                //     var PC = values[values.length-1]-values[values.length-2];
                //     var absPC = Math.abs(PC);
                //
                //     return null;
                // }else {
                    return null;
                // }
            }
        }
    }
};
module.exports = Indicators;