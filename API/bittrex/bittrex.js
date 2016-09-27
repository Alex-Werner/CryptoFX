var moment = require('moment');
var requestify = require('requestify');
var request = require('request');
var Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

//https://bittrex.com/Home/Api
var bittrexApiUrl = "https://bittrex.com/api/v1.1/";

var requester = {
    
};

var Bittrex = {
    _get:function(url){
        return new Promise(function(resolve, reject){
            
           requestify.get(url).then(function(res){
               resolve(res.getBody());
           }) 
        });
    },
    _post:function(url, postData){
        return new Promise(function (resolve, reject) {
            request.post(url, {json:postData},
            function(error, response, body){
                if(!error && response.statusCode==200){
                    resolve(body);
                }else{
                    reject(response);
                }
            })
        })
    },
    accountAPI:{
        
    },
    marketAPI:{
        
    },
    publicAPI:{
         _url:bittrexApiUrl+'public/',
        /* GET REQUEST */
        /**
         * Used to get the open and available trading markets at Bittrex along with other meta data.
         * @returns {*}
         */
        getMarkets:function () {
            var url = Bittrex.publicAPI._url+'getmarkets';
            return async(function(){
                return await(Bittrex._get(url));
            })();
        },
        /**
         * Used to get all supported currencies at Bittrex along with other meta data.
         * @returns {*}
         */
        getCurrencies:function () {
            var url = Bittrex.publicAPI._url+'getcurrencies';
            return async(function(){
                return await(Bittrex._get(url));
            })();
    
        },
        /**
         * Used to get the last 24 hour summary of all active exchanges
         * @returns {*}
         */
        getMarketSummaries:function () {
            var url = Bittrex.publicAPI._url+'getmarketsummaries';
            return async(function(){
                return await(Bittrex._get(url));
            })();
    
        },
        /* POST REQUEST */
        /**
         * Used to get the current tick values for a market.
         * @param pair The pair is something that look like "btc-eth"
         * @returns {*}
         */
        getTicker:function(pair){
            if(!pair){
                return false;
            }
            var url = Bittrex.publicAPI._url+'getticker';
    
            return async(function(){
                    var postData = {
                        market:pair.toLowerCase()
                    };
                  
                    return await(Bittrex._post(url, postData));
                    
            })();
        },
        /**
         * Used to get the last 24 hour summary of a specific active exchanges
         * @param pair
         * @returns {*}
         */
        getMarketSummary:function(pair){
            if(!pair){
                return false;
            }
            var url = Bittrex.publicAPI._url+'getmarketsummary';
    
            return async(function(){
                    var postData = {
                        market:pair.toLowerCase()
                    };
                    return await(requestify.post(url,postData)).getBody();
            })();
        },
        /**
         * Used to get retrieve the orderbook for a given market
         * @param pair
         * @param type
         * @param depth optional defaults to 20 - how deep of an order book to retrieve. Max is 50
         * @returns {*}
         */
        getOrderBook:function(pair, type, depth){
            if(!pair || !type){
                return false;
            }
            var url = Bittrex.publicAPI._url+'getorderbook';
            return async(function(){
                var postData = {
                    market:pair.toLowerCase(),
                    type:type.toLowerCase()
                };
                if(depth){
                    postData.depth=depth;
                }
                return await(requestify.post(url,postData)).getBody();
            })();
        },
        /**
         * Used to retrieve the latest trades that have occured for a specific market.
         * @param pair
         * @param count Optional a number between 1-50 for the number of entries to return (default = 20)
         * @returns {*}
         */
        getMarketHistory:function(pair, count){
            if(!pair){
                return false;
            }
            var url = Bittrex.publicAPI._url+'getmarkethistory';
            return async(function(){
                var postData = {
                    market:pair.toLowerCase(),
                };
                if(count){
                    postData.count=count;
                }
                return await(requestify.post(url,postData)).getBody();
            })();
        }
    }
};

module.exports = Bittrex;