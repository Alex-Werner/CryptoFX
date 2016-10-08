CryptoFX

## Current State
Pre-Alpha v0.1.0

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

#### Quick access :

-  [Documentation](DOCUMENTATION.md)
-  [Changelog](CHANGELOG.md)
-  [Roadmap](ROADMAP.md)
-  [ToDos](ROADMAP.md#todos)
-  [NPM Package file](package.json)

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

- FETCHER : Call API (see Markets) and send data to MIB
- MIB : Mainly used as a tick store | HTTP : 12121
- MAB : Mainly used to store analyzed tick (Indicators, MarketSignals)

To be born : 

- ~~CARL : Main interface that will operate user needs~~
- SmartAnalyst : 
    At first launch, Get data from MIB, analyze them, compute them in terms of tickframe and send it to MAB
    after that, periodically get misisng data from MIB and MAB.
- TradingOperator : Able to Buy or Sell
- WalletManager : Able to handle Wallet (virtual ?)
- CryptoStrategist : Understand strategy and signals.

## Critical TODO
    - Implement databse !


## Markets Exchanges handled : 

- Bittrex : Honestly, It could work... But there is an issues with caching that is not resolved yet. So consider it down. 
- Poloniex : Handled for Nth (configurated) top Market (30s between two ticks fetch)   
- Kraken : Upcoming Prio 2! 

## Main Features implemented

* Get data (fetch) from Bittrex API
* Execute fetching at the next plain hours (will be useful for data analysis)
* Populate tick in MIB Db.
* Fetch tick from MIB to MAB
* Create Candle (open, close, mid, bid, ask, last, low, high, BTCVol)
* Calculate Technical Indicators:
    - SMA(10), SMA(20), SMA(50), SMA(100), SMA(200)
    - True stength index (25,13)
    - EMA(27)
* Calculate MarketSignals : 
    - largeGoldenCross(200,50)
    - largeDeathCross(200,50)

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

This work is licensed under the Mozilla Public License Version 2.0

| Permissions      	| Conditions                   	| Limitations   	|
|------------------	|------------------------------	|---------------	|
| * Commercial Use 	| Disclose Source              	| Hold Liable   	|
| Distribution     	| License and Copyright Notice 	| Trademark Use 	|
| Modification     	| Same License                 	|               	|
| Patent Use       	|                              	|               	|
| Private Use      	|                              	|               	|
|                  	|                              	|               	|
|                  	|                              	|               	|
