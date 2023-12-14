import test from 'node:test';
import assert from 'node:assert';

import { Random } from 'xoshiro128/random';

import { randomFloat } from './float-tools.mjs';

import { floatToBigInt, bigIntToFloat } from './full-precision-with-bigints.mjs';

let largestSubnormal = 2.22507385850720088902e-308;
let smallestNormal = 2.22507385850720138309e-308;
let smallest = 4.94065645841246544177e-324;

function sum(a, b) {
  return bigIntToFloat(floatToBigInt(a) + floatToBigInt(b));
}

function checkRoundTrip(a) {
  assert.strictEqual(bigIntToFloat(floatToBigInt(a)), a);
}

function checkSum(a, b) {
  let actual = sum(a, b);
  let expected = a + b;
  if (!Object.is(actual, expected)) {
    if (Object.is(a, -0) && Object.is(b, -0)) {
      // bigint can't represent -0
      return;
    }
    console.error(a);
    console.error(b);
  }
  assert.strictEqual(actual, expected);
}

test('basic round-tripping', t => {
  checkRoundTrip(largestSubnormal);
  checkRoundTrip(smallestNormal);
  checkRoundTrip(smallest);
});

test('round ties to even', t => {
  let half11Delta = 8.88178419700125232339e-16;
  let nextFloatAfterHalf11Delta = 8.88178419700125429554e-16;

  let eleventPlusSignificandOne = 11.0000000000000017764;
  let eleventPlusSignificandTwo = 11.0000000000000035527;

  assert.strictEqual(sum(11, half11Delta), 11);
  assert.strictEqual(sum(eleventPlusSignificandOne, half11Delta), eleventPlusSignificandTwo);
});

test('subnormal edge cases', t => {
  assert.strictEqual(sum(largestSubnormal, smallest), smallestNormal);
  assert.strictEqual(sum(smallestNormal, -smallest), largestSubnormal);
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
    let a = randomFloat(random);
    let b = randomFloat(random);
    checkSum(a, b);
  }
});
