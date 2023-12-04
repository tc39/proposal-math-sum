let bits = new ArrayBuffer(8);
let view = new DataView(bits);
export function floatFromParts({ sign, exponent, significand }) {
  view.setBigUint64(0, BigInt(significand));
  let top16Bits = (sign << 15) | (exponent << 4) | (view.getUint8(1) & 0xf);
  view.setUint16(0, top16Bits);
  return view.getFloat64(0);
}

export function partsFromFloat(double) {
  view.setFloat64(0, double);
  let sign = view.getUint8(0) >>> 7;
  let exponent = (view.getUint16(0) >>> 4) & 0x7ff; // 11 bits. don't forget the bias!
  let significand = Number(view.getBigUint64(0) & 0xfffffffffffffn); // 52 bits
  return { sign, exponent, significand };
}

let interestingExponents = [2046, 2045, 1994, 1995, 1993, 0, 1, 2, 1021, 1022, 1023, 1024, 1025, 1026];
let interestingSignificands = [0b1111111111111111111111111111111111111111111111111111, 0b1000000000000000000000000000000000000000000000000000, 0b1000000000000000000000000000000000000000000000000001, 0b1111111111111111111111111111111111111111111111111110, 0b111111111111111111111111111111111111111111111111111, 0, 1, 2];

export function randomFloat(random) {
  let sign = random.int(0, 1);
  let exponent = random.boolean() ? random.pick(interestingExponents) : random.int(0, 2046);
  let significand = random.boolean() ? random.pick(interestingSignificands) : Math.floor(random.float(0, 2**52));
  return floatFromParts({ sign, exponent, significand });
}
