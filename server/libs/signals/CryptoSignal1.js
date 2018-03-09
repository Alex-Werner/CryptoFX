const Signal = require('./signal')
class CryptoSignal1 extends Signal {
  constructor(opts){
    super();
    //Weight from 0 to 10
    this.specs = opts.specs;

    this.results = [];
    this.result = 0;
  }
  consider(el){
    this.calculate(el)
  }
  calculate(el){
    this.bearScore = 0;
    this.bullScore = 0;

    let specs = this.specs;
    let strats = el.strategies;
    let indics = el.indicators;
    // console.log(strats)
    let calculations = [[],[]];
    let bullCalculations = calculations[0];
    let bearCalculations = calculations[1];

    //Bull Calculation
    (strats.GoldenCross && specs.GoldenCross.active) ? bullCalculations.push(specs.GoldenCross.importance) : bullCalculations.push(0);
    (strats.TSIBullCross && specs.TSIBullCross.active) ? bullCalculations.push(specs.TSIBullCross.importance) : bullCalculations.push(0);
    (strats.PPOBullCross && specs.PPOBullCross.active) ? bullCalculations.push(specs.PPOBullCross.importance) : bullCalculations.push(0);
    (indics.RSI14>=this.specs.rsi.thresholds.high && specs.rsi.active) ? bullCalculations.push(specs.rsi.importance) : bullCalculations.push(0);
    (indics.TSI>=this.specs.tsi.thresholds.high && specs.tsi.active) ? bullCalculations.push(specs.tsi.importance) : bullCalculations.push(0);
    //When short term became in the long term trend again
    (strats.LongTrendAnalysis===1 && strats.ShortTrendAnalysis===1 && specs.trendsConjunction.active) ? bullCalculations.push(specs.trendsConjunction.importance) : bullCalculations.push(0);


    //Bear Calculations
    (strats.DeathCross && specs.DeathCross.active) ? bearCalculations.push(specs.DeathCross.importance) : bearCalculations.push(0);
    (strats.TSIBearCross && specs.TSIBearCross.active) ? bearCalculations.push(specs.TSIBullCross.importance) : bearCalculations.push(0);
    (strats.PPOBearCross && specs.PPOBearCross.active) ? bearCalculations.push(specs.PPOBearCross.importance) : bearCalculations.push(0);
    (indics.RSI14<=this.specs.rsi.thresholds.low && specs.rsi.active) ? bearCalculations.push(specs.rsi.importance) : bearCalculations.push(0);
    (indics.TSI<=this.specs.tsi.thresholds.low && specs.tsi.active) ? bearCalculations.push(specs.tsi.importance) : bearCalculations.push(0);
    //When short term became in the long term trend again
    (strats.LongTrendAnalysis===-1 && strats.ShortTrendAnalysis===-1 && specs.trendsConjunction.active) ? bearCalculations.push(specs.trendsConjunction.importance) : bearCalculations.push(0);


    this.bearScore = bearCalculations.reduce(function (acc, el) {
      return acc + el
    },0)
    this.bullScore = bullCalculations.reduce(function (acc, el) {
      return acc + el
    },0)

    this.results.push(calculations)

    // this.score = this.bullScore - this.bearScore;
    this.score = this.bearScore - this.bullScore;
    //Result
    // console.log({bs:this.bullScore, brs:this.bearScore, score:this.score})
    this.result= this.score || 0

    // if(this.result>0) console.log(calculations)
    // this.result = (this.bullScore-this.bearScore) || 0;
  }
  get(){
    return this.result;
  }
}
module.exports = CryptoSignal1;