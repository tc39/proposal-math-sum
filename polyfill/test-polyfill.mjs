import assert from 'node:assert';
import test from 'node:test';

import { Random } from 'xoshiro128/random';

import { sum as mathSum } from './polyfill.mjs';

import { floatToBigInt, bigIntToFloat } from './full-precision-with-bigints.mjs';
import { randomFloat } from './float-tools.mjs';


function sumViaBigInt(iterable) {
  let sum = 0n;
  for (let x of iterable) {
    sum += floatToBigInt(x);
  }
  return bigIntToFloat(sum);
}

function check(data) {
  let actual;
  try {
    actual = mathSum(data);
  } catch (e) {
    console.log({ data });
    throw e;
  }
  let expected = sumViaBigInt(data);
  if (!Object.is(actual, expected)) {
    console.log({ data, actual, expected });
  }
  assert.strictEqual(actual, expected);
}

test('basic ability to handle intermediate overflows', t => {
  check([1e308, 1e308, 0.1, 0.1, 1e30, 0.1, -1e30, -1e308, -1e308]);
  check([1e30, 0.1, -1e30]);
});

test('special cases', t => {
  assert.strictEqual(mathSum([]), -0);
  assert.strictEqual(mathSum([-0, -0, -0]), -0);
  assert.strictEqual(mathSum([-0, -0, -0, 0]), 0);
  assert.strictEqual(mathSum([1, Infinity, -1e308]), Infinity);
  assert.strictEqual(mathSum([1, Infinity, -1e308, -Infinity]), NaN);
  assert.strictEqual(mathSum([Infinity]), Infinity);
  assert.strictEqual(mathSum([-Infinity]), -Infinity);
  assert.strictEqual(mathSum([-Infinity, Infinity]), NaN);
});

test('1, 2 element lists', t => {
  check([1e308]);
  check([1e308, 1e308]);
  check([1e308, -1e308]);
  check([.1]);
  check([.1, .1]);
  check([.1, -.1]);
});

test('some edge cases from the fuzzer', t => {
  check([8.98846567431158e+307, 8.988465674311579e+307, -1.7976931348623157e+308]);

  check([-5.630637621603525e+255, 9.565271205476345e+307, 2.9937604643020797e+292]);

  check([6.739986666787661e+66, 2, -1.2689709186578243e-116, 1.7046015739467354e+308, -9.979201547673601e+291, 6.160926733208294e+307, -3.179557053031852e+234, -7.027282978772846e+307, -0.7500000000000001]);

  check([0.31150493246968836, -8.988465674311582e+307, 1.8315037361673755e-270, -15.999999999999996, 2.9999999999999996, 7.345200721499384e+164, -2.033582473639399, -8.98846567431158e+307, -3.5737295155405993e+292, 4.13894772383715e-124, -3.6111186457260667e-35, 2.387234887098013e+180, 7.645295562778372e-298, 3.395189016861822e-103, -2.6331611115768973e-149])

  check([-1.1442589134409902e+308, 9.593842098384855e+138, 4.494232837155791e+307, -1.3482698511467367e+308, 4.494232837155792e+307]);
  check([-1.1442589134409902e+308, 4.494232837155791e+307, -1.3482698511467367e+308, 4.494232837155792e+307]);

  check([9.593842098384855e+138,  -6.948356297254111e+307, -1.3482698511467367e+308, 4.494232837155792e+307]);

  check([-2.534858246857893e+115, 8.988465674311579e+307, 8.98846567431158e+307])

  check([1.3588124894186193e+308, 1.4803986201152006e+223, 6.741349255733684e+307]);

  check([6.741349255733684e+307, 1.7976931348623155e+308, -7.388327292663961e+41]);

  check([-1.9807040628566093e+28, 1.7976931348623157e+308, 9.9792015476736e+291]);

  check([-1.0214557991173964e+61, 1.7976931348623157e+308, 8.98846567431158e+307, -8.988465674311579e+307]);
});

test('fuzzing', t => {
  let seed = Math.floor(Math.random() * 2 ** 31);
  console.log('fuzzer seed', seed);
  let random = new Random(seed);
  let N = 1_000_000;
  for (let i = 0; i < N; ++i) {
    if ((i % 100_000) === 0) {
      console.log(i);
    }
    let data = [];
    let length = random.int(3, 10);
    for (let j = 0; j < length; ++j) {
      data.push(randomFloat(random));
    }
    check(data);
  }
});
