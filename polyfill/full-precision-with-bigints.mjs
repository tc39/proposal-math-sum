import { floatFromParts, partsFromFloat } from './float-tools.mjs';

export function floatToBigInt(double) {
  if (!Number.isFinite(double)) throw new Error('todo');
  let { sign, exponent, significand } = partsFromFloat(double);
  let magnitude;
  if (exponent === 0) {
    magnitude = BigInt(significand);
  } else {
    significand = 2n ** 52n + BigInt(significand);
    magnitude = 2n ** (BigInt(exponent - 1)) * significand;
  }
  return sign ? -magnitude : magnitude;
}

export function bigIntToFloat(bigint) {
  let sign = bigint < 0 ? 1 : 0;
  let magnitude = bigint < 0 ? -bigint : bigint;
  let binary = magnitude.toString(2);
  if (binary.length <= 52) {
    // subnormal
    let significand = parseInt(binary, 2);
    let exponent = 0;
    return floatFromParts({ sign, exponent, significand });
  }

  let significandString = binary.slice(1, 53);
  let significand = parseInt(significandString, 2);
  let exponent = binary.length - 52;
  // round up if we are at least half way. if up is towards-even we always round up; otherwise we round up iff it is above the halfway point, i.e. there is a non-zero bit after the first
  let roundUp = binary[53] === '1' && (binary[52] === '1' || binary.slice(54).includes('1'));
  if (roundUp) {
    significand += 1;
    if (significand === 2 ** 52) {
      significand = 0;
      exponent += 1;
    }
  }
  if (exponent > 2046) {
    return sign ? -Infinity : Infinity;
  }

  return floatFromParts({ sign, exponent, significand });
}
