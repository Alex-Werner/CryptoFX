const cl = console.log

module.exports = function (candles) {
  let lastTime = +new Date()
  candles.calculate();
  let processTime = +new Date()-lastTime;
  cl(`[100%] Candle calculated - Took ${processTime} ms`);
  return candles;
}