CryptoFX

## Current State
Pre-Alpha-unstable v0.0.1

## Overview

The main goal of CryptoFX is to allow create a trading online based and social platform.
It should be able to automatize most of

## Technology behind
* **NodeJS** (trying to use last NodeJS tech -> node.green) (https://nodejs.org)
* **Bluebird** - Optimized promise library (http://bluebirdjs.com) 
* **asyncawait** - Callback heaven for Node.js with async/await (https://github.com/yortus/asyncawait)
* **moment** - Parse, validate, manipulate, and display dates in javascript. (http://momentjs.com)
* **Seneca** - A microservices toolkit for Node.js. (http://senecajs.org)
* ~~**ws** - Lightning fast websocket~~ (https://github.com/websockets/ws)
* MongoDB/LokiJS (to be defined),actual : In-Mem db ? (https://www.mongodb.com / lokijs.org)

## Install
```npm install```

## Testing 
```node tests/test.js```

## Start 
On windows :
 - Navigate to root ```cd CryptoFX```
 - Start CMD (from root) ```"bin/win/start_all.bat"
 It will then open one CMD per node(microservices), theses microservices being connected by seneca 

## MicroServices 
- MIB : Mainly used as a tick store | HTTP : 12121
- MAB : Mainly used to store analyzed tick. These ticks are stored using SmartAnalyst (Indicators:RSI, MACD...)
- CARL : Not fully defined it will probably make a bridge between MIB and MAT for sometimes.
- FETCHER : now it's calling bittrex API and send data to MIB.

To be born : 

- PriceFetcher : Call API and send data to MIB
- SmartAnalyst : Get data from MIB, analyze them, compute them in terms of tickframe and send it to MAB
- TradingOperator : Able to Buy or Sell
- WalletManager : Able to handle Wallet (virtual ?)
- CryptoStrategist : Understand strategy and signals.

## Main Features implemented

* Get data (fetch) from Bittrex API
* Execute fetching at the next plain hours (will be useful for data analysis)
* Populate tick in MIB Db.

## Upcoming Features / Schedule

* Be able to run it on a local PC first (server will come next, but well, It just need a .sh instead of a .bat).
* Be able to connect to one of the trading online platform (kraken).
* Be able to gives instructions, modify a parameter using command line
* Be able to do same than above using an admistration interface
* Be able to use it in a meteor app
* Create an API
* Store data in a Raw Database
* Handle data from raw DB and analyze them in another db (treated db)
* In-browser graph (tradingview/meta-trader style)
* VirtualWallet
* RealWallet
* Indicators
* WebBased interface

### API 
# MIB (Raw DB) : 

* Store a tick :  Commands : role: 'MIB', store: 'ticker' | Params :  pair: {String}, exchange: {String}, ask {Number}, bid {Number}, last {Number} | Response : response {String}, dbSize {String}
* Get a tick : Commands : role: 'MIB', store: 'lastPrice' | Params :  pair: {String}, exchange: {String} | Response : response {String}, lastPrice {Object}, lastPrice.marketName {string}, lastPrice.price {number}, lastPrice.time} : {String}


## Contact

For any help or questions you can contact me by twitter : @obusco.

## Licence

This work is licensed under the Creative Commons
Attribution-NonCommercial-NoDerivs 3.0 Unported License.
To view a copy of this license, visit
http://creativecommons.org/licenses/by-nc-nd/3.0/.

## Licence details

This is a temporary decision, I want to offer a way to people (especially beginner developer), to consult the code behind
CryptoFX, but as I don't know yet where I want to go with this project, I want to protect myself a little.
If I can afford it, the main goal is to made it open-source and as permissive as possible.
