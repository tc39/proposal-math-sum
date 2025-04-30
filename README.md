# Math.sumPrecise

A proposal to add a method to sum multiple values to JavaScript.

## Status

Authors: Kevin Gibbons

Champions: Kevin Gibbons

This proposal is at stage 3 of [the TC39 process](https://tc39.es/process-document/): the proposal is ready for implementations. [Tests are available](https://github.com/tc39/test262/pull/4049) in test262. See [issue #19](https://github.com/tc39/proposal-math-sum/issues/19) for implementation status.

## Motivation

Summing a list is a very common operation and is one of the few remaining use cases for `Array.prototype.reduce`. Better to let users express that operation directy.

Also, summing a list of floating point numbers can be done more precisely than the naive `.reduce((a, b) => a + b, 0)` approach using more clever algorithms, a fact which few JavaScript programmers are aware of (and even among those who are, most wouldn't bother doing it). We can make it easy to reach for the better option.

## Proposal

Add an iterable-taking `Math.sumPrecise` method which returns the sum of the values in the iterable using a more precise algorithm than naive summation.

```js
let values = [1e20, 0.1, -1e20];

values.reduce((a, b) => a + b, 0); // 0

Math.sumPrecise(values); // 0.1
````

## Questions

### Which algorithm?

Instead of specifying any particular algorithm, this proposal requires the maximally correct answer - that is, the answer you'd get if you did arbitrary-precision arithmetic, then converted the result back to floats. This can be done without actually needing arbitrary-precision arithmetic. One way of doing this is given in [Shewchuk '96](./Shewchuk-robust-arithmetic.pdf), which I've [implemented in JS](./polyfill/polyfill.mjs) (plus some details to handle intermediate overflow). Other strategies are possible.

Python's [`math.fsum`](https://docs.python.org/3/library/math.html#math.fsum) is currently implemented using the same algorithm (though without handling intermediate overflow).

A more recent algorithm is given in [Fast exact summation using small and large superaccumulators](https://arxiv.org/abs/1505.05571) by Radford M. Neal, MIT-licensed code for which is available [here](https://gitlab.com/radfordneal/xsum).

### Iterable-taking or variadic?

`Math.max` precedent suggests variadic, but that's really not what you want - once your lists get larger than a few tens of thousands of elements, you'll probably overflow the stack and get a RangeError.

So this proposal includes only an iterable-taking form.

### Naming

`Math.sum` is the obvious name, but it's not obvious that this going to be a different (slower) algorithm than naive summation. This is called `Math.sumPrecise` to call attention to that difference.

### Should this coerce things to number, or throw if given something which is not a number?

It will reject non-number values, breaking with precedent from `Math.max`.

### Is the sum of an empty list 0 or -0?

It is -0. This is the floating point additive identity. This choice ensures that `Math.sumPrecise([]) + Math.sumPrecise(foo)` always gives the same answer as `Math.sumPrecise(foo)`.

### Should this work with BigInts?

[No](https://github.com/tc39/proposal-bigint-math/issues/23) - it's important that `Math.sumPrecise([])` returns the Number `-0` (or `0`), which means that `5n + Math.sumPrecise(bigints)` would throw when `bigints` is empty, which would be bad.

We could have separate methods for summing BigInts. I'd vote for `BigInt.sum` or `BigInt.sumFrom`, depending on the outcome of the naming discussion above. But such a method will not be part of this proposal.

### What about product?

That comes up much less so I'm not currently proposing it.
