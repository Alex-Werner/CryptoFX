const Fetcher = require('./Fetcher.js');


const logPath = '../logs/fetcher.log';
const markets = ['binance'];
const fetchInterval = 60*1000;

let fetcher = new Fetcher({
  logPath, markets, fetchInterval
});

fetcher.start();