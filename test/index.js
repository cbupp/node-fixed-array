var assert = require("assert");
var tap = require("tap");
var test = tap.test;
var fa;

test("load", function (t) {
  t.plan(1);

  fa = require("../lib/");
  t.ok(fa, "loaded module");

  t.end();
});

// create
test("create-empty", function (t) {
  t.plan(7);

  var fvh = fa.newFixedValueHistory(100);
  t.ok(fvh instanceof fa.FixedValueHistory, "Type should be a FixedValueHistory");
  t.equal(fvh.length(), 0, "Initial length is 0");
  t.equal(fvh.sum, 0, "Initial sum is 0");
  t.ok(isNaN(fvh.min()), "Initial min is NaN");
  t.ok(isNaN(fvh.max()), "Initial max is NaN");
  t.ok(isNaN(fvh.mean()), "Initial mean is NaN");

  var expected = [];
  t.equivalent(fvh.values(), expected);

  t.end();
});
test("create-populated", function (t) {
  t.plan(6);

  var initial = [10, 0, 3, 11, 20, 22, 2, 99, 19];
  var fvh = fa.newFixedValueHistory(100, initial);
  t.ok(fvh instanceof fa.FixedValueHistory, "Type should be a FixedValueHistory");
  t.equal(fvh.length(), initial.length, "Initial length is matches initial input");
  t.equal(fvh.sum, 186, "Initial sum is 186");
  t.equal(fvh.min(), 0, "Initial min is 0");
  t.equal(fvh.max(), 99, "Initial max is 99");
  t.equal(fvh.mean(), 186/9, "Initial mean is 186 / 9");

  t.end();
});
test("create-overpopulated", function (t) {
  t.plan(7);

  var initial = [10, 0, 3, 11, 20, 22, 2, 99, 19];
  var max_length = 5;
  var fvh = fa.newFixedValueHistory(max_length, initial);
  t.ok(fvh instanceof fa.FixedValueHistory, "Type should be a FixedValueHistory");
  t.equal(fvh.length(), max_length, "Initial length is truncated to max_length");
  t.equal(fvh.sum, 162, "Initial sum is 162");
  t.equal(fvh.min(), 2, "Initial min is 2");
  t.equal(fvh.max(), 99, "Initial max is 99");
  t.equal(fvh.mean(), 162/5, "Initial mean is 162 / 5");

  var expected = [20, 22, 2, 99, 19];
  t.equivalent(fvh.values(), expected);

  t.end();
});

// push
test("push", function (t) {
  t.plan(26);

  var max_length = 5;
  var fvh = fa.newFixedValueHistory(max_length);
  fvh.push(1);
  t.equal(fvh.length(), 1, "Length shows value pushed");
  t.equal(fvh.sum, 1);
  t.equal(fvh.min(), 1);
  t.equal(fvh.max(), 1);
  t.equal(fvh.mean(), 1);

  fvh.push(9);
  t.equal(fvh.length(), 2, "Length shows value pushed");
  t.equal(fvh.sum, 10);
  t.equal(fvh.min(), 1);
  t.equal(fvh.max(), 9);
  t.equal(fvh.mean(), 5);

  fvh.push([5, 5]);
  t.equal(fvh.length(), 4, "Length shows values pushed");
  t.equal(fvh.sum, 20);
  t.equal(fvh.min(), 1);
  t.equal(fvh.max(), 9);
  t.equal(fvh.mean(), 5);

  fvh.push([5, 5]);
  t.equal(fvh.length(), max_length, "Length shows values pushed and one expired");
  t.equal(fvh.sum, 29);
  t.equal(fvh.min(), 5);
  t.equal(fvh.max(), 9);
  t.equal(fvh.mean(), 29/5);

  // Pushing on more than max_length
  fvh.push([1, 1, 1, 1, 1, 1]);
  t.equal(fvh.length(), max_length, "Length shows values pushed and one expired");
  t.equal(fvh.sum, 5);
  t.equal(fvh.min(), 1);
  t.equal(fvh.max(), 1);
  t.equal(fvh.mean(), 1);

  var expected = [1, 1, 1, 1, 1];
  t.equivalent(fvh.values(), expected);

  t.end();
});

// non-numeric input
test("non-numeric", function (t) {
  t.plan(11);

  var max_length = 5;
  var fvh = fa.newFixedValueHistory(max_length);
  fvh.push("cat");
  t.equal(fvh.length(), 1, "Length shows value pushed");
  t.equal(fvh.sum, 0);
  t.ok(isNaN(fvh.min()), "Initial min is NaN");
  t.ok(isNaN(fvh.max()), "Initial max is NaN");
  t.equal(fvh.mean(), 0, "Initial mean is NaN");

  fvh.push(1);
  t.equal(fvh.length(), 2, "Length shows value pushed");
  t.equal(fvh.sum, 1);
  t.ok(isNaN(fvh.min()), "min when there is a NaN is NaN");
  t.ok(isNaN(fvh.max()), "max when there is a NaN is NaN");
  t.equal(fvh.mean(), 1/2, "Mean adjusted for NaN values as NULL");

  var expected = ["cat", 1];
  t.equivalent(fvh.values(), expected);

  t.end();
});