# Math.sum

A proposal to add a method to sum multiple values to JavaScript.

## Status

Authors: Kevin Gibbons

Champions: Kevin Gibbons

This proposal is at Stage 0 of [the TC39 process](https://tc39.es/process-document/) - it has not yet been presented to committee.

## Motivation

Summing a list is a very common operation and is one of the few remaining use cases for `Array.prototype.reduce`. Better to let users express that operation directy.

Also, floating point summation can get more precise results than the naive `.reduce((a, b) => a + b, 0)` approach using [more clever algorithms](https://en.wikipedia.org/wiki/Kahan_summation_algorithm) with very little overhead, a fact which few JavaScript programmers are aware of (and even among those who are, most wouldn't bother doing it). We can make it easy to reach for the better option.

## Proposal

Add a variadic `Math.sum` method which returns the sum of its arguments using a more clever algorithm than naive summation.

```js
let values = Array.from({ length: 10 }).fill(0.1);

values.reduce((a, b) => a + b, 0); // 0.9999999999999999

Math.sum(...values); // 1
````

## Questions

### Which algorithm?

I'm hoping to get away with leaving it up to implementations. If we have to pick one, I would go with Neumaier's variant of Kahan summation. Python [adopted it](https://github.com/python/cpython/issues/100425) for their built-in `sum` in 3.12, with about 25-30% slowdown relative to naive summation. I think that's easily worth it.

## What if I have a long list, such that I can't reasonably put it on the stack with `...args`?

I'd like to have a version which works with iterables. Unfortunately `Math.max` sets precedent that such methods are variadic, so `Math.sum` probably will need to be as well.

In my ideal world we would also add `Math.maxFrom` and `Math.sumFrom` (or some other, better names) which operate on iterables instead of varargs.

## Should this coerce things to number, or throw if given something which is not a number?

I want to [stop coercing things](https://github.com/tc39/how-we-work/pull/136), but unfortunately `Math.max` is pretty strong precedent that we do coercion.

I'm hopeful that engines will be able to have a fast path when they know everything is a Number already, at least for the iterable-taking version. 

## Should this work with BigInts?

[No](https://github.com/tc39/proposal-bigint-math/issues/23) - it's important that `Math.sum()` returns the Number `0`, which means that `5n + Math.sum(...bigints)` would throw when `bigints` is empty, which would be bad.

We should have seperate methods for summing BigInts. I'd vote for `BigInt.sum`. Maybe as part of this proposal, maybe not.

## What about product?

That comes up much less so I'm not currently proposing it.
