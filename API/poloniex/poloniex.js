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
    _getPublicCall: function (command) {
        var allowedCommand = ['returnTicker'];
        return new Promise(function (resolve, reject) {
            if (allowedCommand.indexOf(command) > -1) {
                var url = Poloniex._config.publicAPIUrl + "?command=" + command;
                request.get(url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        return resolve(body);
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