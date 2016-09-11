CryptoFX

## Current State
Pre-Alpha-unstable v0.0.1

## Overview

The main goal of CryptoFX is to allow create a trading online based and social platform.
It should be able to automatize most of

## Technology behind
* **NodeJS** (trying to use last NodeJS tech -> node.green)
* **Bluebird** - Optimized promise library
* **asyncawait** - Callback heaven for Node.js with async/await
* **moment** - Parse, validate, manipulate, and display dates in javascript.
* MongoDB/LokiJS (to be defined),actual : In-Mem db ?

## Install
```npm install```

## Testing 
```node tests/test.js```

## Start 
```node main.js```

## Main Features implemented

* Get data from Bittrex API
* Populate tick in MIB Db.

## Upcoming Features / Schedule


* Be able to run it on a local PC first (server will come next).
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
