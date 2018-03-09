var moment = require('moment');
var request = require('request');
var Promise = require('bluebird');
// var Crypto = require('crypto');
// var Nonce = require('nonce')();


//Todo : Externalize 

var configurationData = {
    publicAPIUrl: "https://poloniex.com/public"
};
const Poloniex = {
    _config: configurationData,
    _getPublicCall: function (command, params) {
        var allowedCommand = ['returnTicker','returnChartData'];
        return new Promise(function (resolve, reject) {
            if (allowedCommand.indexOf(command) > -1) {
                var url = Poloniex._config.publicAPIUrl + "?command=" + command;
                if(params){
                    for(var paramsName in params){
                        url = url+"&"+paramsName+"="+params[paramsName];
                    }
                }
                request.get(url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        return resolve({body:JSON.parse(body), params:params, command:command, url:url});
                    } else {
                        return reject(response);
                    }
                });
            } else {
                return reject('Bad command');
    
            }
            
        });
    },
    /**
     * Used to get the currents tick values for all markets.
     * @return Promise
     */
    getTickers: function () {
        return Poloniex._getPublicCall('returnTicker');
    },
    
    getHistoricData:function(currencyPair, startUnixSeconds, endUnixSeconds, periodSeconds){
        return (Poloniex._getPublicCall('returnChartData',{
            currencyPair:currencyPair || "BTC_XMR",
            start:startUnixSeconds || (moment().subtract(1,'days').unix()),
            end:endUnixSeconds || (moment().unix()),
            period:periodSeconds || (86400)
        }));
    }
    
};

// var marketsDB = {};
// cl=console.log;
//
// var fetch = function(){
//     cl('fetch', moment().format('YYYY-MM-DD HH:mm:ss'));
//     Poloniex.getTickers().then(function (result) {
//         var tickers = JSON.parse(result);
//         for(var markets in tickers){
//             if(marketsDB[markets]){
//                 if(marketsDB[markets]!==  tickers[markets].last){
//                     cl('changed ', markets);
//                     marketsDB[markets] = tickers[markets].last;
//                 }
//             }else{
//                 marketsDB[markets] = tickers[markets].last;
//             }
//         }
//     })
// };
//
// fetch();
// setInterval(fetch, 60000);

module.exports = Poloniex;