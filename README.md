# Math.sumExact

A proposal to add a method to sum multiple values to JavaScript.

## Status

Authors: Kevin Gibbons

Champions: Kevin Gibbons

This proposal is at stage 2 of [the TC39 process](https://tc39.es/process-document/): the proposal has been accepted as a draft.

## Motivation

Summing a list is a very common operation and is one of the few remaining use cases for `Array.prototype.reduce`. Better to let users express that operation directy.

Also, summing a list of floating point numbers can be done more precisely than the naive `.reduce((a, b) => a + b, 0)` approach using more clever algorithms, a fact which few JavaScript programmers are aware of (and even among those who are, most wouldn't bother doing it). We can make it easy to reach for the better option.

## Proposal

Add an iterable-taking `Math.sumExact` method which returns the sum of the values in the iterable using a more precise algorithm than naive summation.

```js
let values = [1e20, 0.1, -1e20];

values.reduce((a, b) => a + b, 0); // 0

Math.sumExact(values); // 0.1
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

`Math.sum` is the obvious name, but it's not obvious that this going to be a different (slower) algorithm than naive summation. This is tentatively called `Math.sumExact` to call attention to that difference.

Since it differs from `Math.max` in taking an iterable, we might want a name which calls attention to that as well, such as `sumExactFrom`. See [issue #3](https://github.com/tc39/proposal-math-sum/issues/3) for discussion.

### Should this coerce things to number, or throw if given something which is not a number?

I want to [stop coercing things](https://github.com/tc39/how-we-work/pull/136), but `Math.max` is pretty strong precedent that we do coercion.

As currently specified it will reject non-number values, breaking with precedent.

### Is the sum of an empty list 0 or -0?

In some sense -0 is the right answer: that's the additive identity on floats.

But in another sense the point is stick as close to real-number arithmetic as possible, and in the reals there is no -0.

Python's `fsum` returns 0 when given an empty list.

As currently specified this will return -0. This question remains open. See [issue #5](https://github.com/tc39/proposal-math-sum/issues/5) for discussion.

### Should this work with BigInts?

[No](https://github.com/tc39/proposal-bigint-math/issues/23) - it's important that `Math.sumExact()` returns the Number `-0` (or `0`), which means that `5n + Math.sumExact(bigints)` would throw when `bigints` is empty, which would be bad.

We could have seperate methods for summing BigInts. I'd vote for `BigInt.sum` or `BigInt.sumFrom`, depending on the outcome of the naming discussion above. But such a method will not be part of this proposal.

### What about product?

That comes up much less so I'm not currently proposing it.
