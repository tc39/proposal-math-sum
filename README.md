# Math.sum

A proposal to add a method to sum multiple values to JavaScript.

## Status

Authors: Kevin Gibbons

Champions: Kevin Gibbons

This proposal is at Stage 1 of [the TC39 process](https://tc39.es/process-document/): the proposal is under consideration.

## Motivation

Summing a list is a very common operation and is one of the few remaining use cases for `Array.prototype.reduce`. Better to let users express that operation directy.

Also, summing a list of floating point numbers can be done more precisely than the naive `.reduce((a, b) => a + b, 0)` approach using more clever algorithms, a fact which few JavaScript programmers are aware of (and even among those who are, most wouldn't bother doing it). We can make it easy to reach for the better option.

## Proposal

Add a variadic `Math.sum` method which returns the sum of its arguments using a more precise algorithm than naive summation.

```js
let values = [1e20, 0.1, -1e20];

values.reduce((a, b) => a + b, 0); // 0

Math.sum(...values); // 0.1
````

## Questions

### Which algorithm?

Instead of specifying any particular algorithm, this proposal requires the maximally correct answer - that is, the answer you'd get if you did arbitrary-precision arithmetic, then converted the result back to floats. This can be done without actually needing arbitrary-precision arithmetic. One way of doing this is given in [Shewchuk '96](./Shewchuk-robust-arithmetic.pdf), which I've [implemented in JS](./polyfill/polyfill.mjs) (plus some details to handle intermediate overflow). Other strategies are possible.

Python's [`math.fsum`](https://docs.python.org/3/library/math.html#math.fsum) is currently implemented using the same algorithm (though without handling intermediate overflow).

### What if I have a long list, such that I can't reasonably put it on the stack with `...args`?

I'd like to have a version which works with iterables. Unfortunately `Math.max` sets precedent that such methods are variadic, so `Math.sum` probably will need to be as well.

In my ideal world we would also add `Math.maxFrom` and `Math.sumFrom` (or some other, better names) which operate on iterables instead of varargs.

### Should this coerce things to number, or throw if given something which is not a number?

I want to [stop coercing things](https://github.com/tc39/how-we-work/pull/136), but unfortunately `Math.max` is pretty strong precedent that we do coercion.

I'm hopeful that engines will be able to have a fast path when they know everything is a Number already, at least for the iterable-taking version. 

### Should this work with BigInts?

[No](https://github.com/tc39/proposal-bigint-math/issues/23) - it's important that `Math.sum()` returns the Number `-0`, which means that `5n + Math.sum(...bigints)` would throw when `bigints` is empty, which would be bad.

We should have seperate methods for summing BigInts. I'd vote for `BigInt.sum`. Maybe as part of this proposal, maybe not.

### What about product?

That comes up much less so I'm not currently proposing it.

### What should the `.length` of the function be?

`Math.max` uses 2, so that's what I'm defaulting to, but it doesn't really matter and if you feel strongly it should be some other thing feel free to send a PR making the change and a case for it.
