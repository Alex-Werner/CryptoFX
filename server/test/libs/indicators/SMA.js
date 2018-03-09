const mocha = require('mocha');
const assert = require('chai').assert;

const SMA = require('../../../libs/indicators/SMA');

describe('Indicators - SMA', () => {
  it('should calculate a SMA', function () {
    let values1 = [12, 15, 17, 21, 24, 30, 35, 40, 32, 30];
    let expected1 = [25.6];
    let opts1 = {
      period: 10,
      values: values1
    }

    const values2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const expected2 = [2, 3, 4, 5, 6, 7, 8, 9];
    let opts2 = {
      period: 3,
      values: values2
    }

    let sma1 = new SMA(opts1);
    let sma2 = new SMA(opts2);

    let output1 = sma1.calculate();
    let output2 = sma2.calculate();

    assert.deepEqual(output1, expected1)
    assert.deepEqual(output2, expected2)
  });

});