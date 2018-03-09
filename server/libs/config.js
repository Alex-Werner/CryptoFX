module.exports = {
  indicators: {
    CCI:{period:90, active:false},
    Momentum:{periods:[10], active:true},
    RSI: {period: 14, active: true},
    MACD: {short:12, long:26, signal:9, histogram:true, active: true},
    StochRSI:{period:14, smooth:3, active : true},
    UltimateOscillator:{short:7, medium:14, long:28,  weights:[4,2,1],active:true},
    SMA: {periods: [3 ,5, 7, 10, 20, 21, 30, 50, 60, 100, 150, 200], active: true},
    EMA: {periods: [3, 5, 7, 10, 12, 20, 26, 30, 40, 50, 60, 80, 100, 150, 200], active: true},//50, 200 for longterm, 16/26 for short term
    TSI: {long: 25, short: 13, signal: 17, active: true},
    PPO: {long: 26, short: 12, signal: 9, active: true},
  },
  strategies: {
    GoldenCross: {active: true},
    DeathCross: {active: true},
    TSIBullCross: {active: true},
    TSIBearCross: {active: true},
    PPOBullCross: {active: true},
    PPOBearCross: {active: true},
    StochRSI:{period:14, high:80, low:20, persistence:6, active:true},
    UltimateOscillator:{active:true},

    LongTrendAnalysis: {active: true},
    ShortTrendAnalysis: {active: true},
  },
  signals: {
    TechnicalAnalysisSummary: {
      active: true
    },
    CryptoSignal1: {
      active: true,
      specs: {
        DeathCross: {
          active: true,
          importance: 2
        },
        GoldenCross: {
          active: true,
          importance: 2
        },
        TSIBullCross: {
          active: true,
          importance: 5
        },
        TSIBearCross: {
          active: true,
          importance: 5
        },
        PPOBearCross: {
          active: true,
          importance: 7
        },
        PPOBullCross: {
          active: true,
          importance: 7
        },
        trendsConjunction: {
          active: true,
          importance: 10
        },
        trendsChange: {
          active: true,
          importance: 20,
          persistence: 5
        },
        //Confirm for a trend
        tsi: {
          active: true,
          importance: 1,
          thresholds: {
            low: -25,
            high: 25,
          },
        },
        rsi: {
          active: true,
          period: 14,
          importance: 1,
          thresholds: {
            low: 30,
            high: 70,
            persistence: 1
          }
        },


        dema: {
          short: 10,
          long: 21,
          thresholds: {
            down: -0.025,
            up: 0.025
          }
        },
        macd: {
          short: 10,
          long: 21,
          signal: 9,
          thresholds: {
            down: -0.025,
            up: 0.025,
            persistence: 1
          }
        },
        ppo: {
          short: 12,
          long: 26,
          signal: 9,
          thresholds: {
            down: -0.025,
            up: 0.025,
            persistence: 2
          }
        },
        stochRSI: {
          interval: 3,
          thresholds: {
            low: 20,
            high: 80,
            persistence: 3
          }
        },


        uo: {
          first: {weight: 4, period: 7},
          second: {weight: 2, period: 14},
          third: {weight: 1, period: 28},
          thresholds: {
            low: 30,
            high: 70,
            persistence: 1
          }
        },
        cci: {
          constant: 0.015, // constant multiplier. 0.015 gets to around 70% fit
          history: 90, // history size, make same or smaller than history
          thresholds: {
            up: 100, // fixed values for overbuy upward trajectory
            down: -100, // fixed value for downward trajectory
            persistence: 0 // filter spikes by adding extra filters candles
          }
        },
        bear: {
          DeathCross: 1,
          rsi: 1
        },
        bull: {
          GoldenCross: 1,
          rsi: 1
        }
      }
    }
  }
}