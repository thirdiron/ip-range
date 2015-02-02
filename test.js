var assert = require('assert');
var ip = require('./');
var util = require('util');

var range = ip.range('192.168.0.1');

assert(range.valid, range.errors);
assert(range.contains('192.168.0.1'));
assert(!range.contains('192.168.0.0'));

// No wildcards in first or second octets
assert.equal(ip.range("*.1.1.1").errors, "Wildcards are not allowed in the first or second octet. ");
assert.equal(ip.range("1.*.1.1").errors, "Wildcards are not allowed in the first or second octet. ");

// No ranges in first or second octets
assert.equal(ip.range("0-255.1.1.1").errors, "Hyphenated values not allowed in first or second octet. ");
assert.equal(ip.range("1.0-255.1.1").errors, "Hyphenated values not allowed in first or second octet. ");


assert.equal(ip.range("1.2.3").errors, "IP must contain 4 octets, contained: 3");
assert.equal(ip.range("1.2.3.a").errors, "error in octet 4, invalid octet spec: 'a'");
assert.equal(ip.range("1.2.3.266").errors, "error in octet 4, octet range out of bounds: '266'");


assert(!ip.range('1.0.1.*').contains('1.0.0.10'));
assert(ip.range('1.2.3.4-10').contains('1.2.3.4', '1.2.3.10'));
assert(ip.range('1.2.3.5', '1.2.3.4').contains('1.2.3.4', '1.2.3.5'));

// Handy tool for generating test data: http://www.ipaddressguide.com/cidr#range
// If the range finishes with wildcards, we should have
// one cidr notation range with a netmask.
assert.equal(ip.range('1.0.1.*').inetAddresses.length, 1);
assert.equal(ip.range('1.0.1.*').inetAddresses[0], '1.0.1.0/24');

assert.equal(ip.range('1.0.*.*').inetAddresses.length, 1);
assert.equal(ip.range('1.0.*.*').inetAddresses[0], '1.0.0.0/16');

// Ranges that don't align on powers of 2 boundaries will require
// multiple cidr notation ranges to specify.

// Our package leans upon the ip-subnet-calculator module
// to do the heavy lifting of calculating cidr notation ranges.
// The current version over-specifies some ranges, but not so
// much as to cause us preformance problems.  We can leave
// eliminating redundant ranges as a possible opportunity for
// improvement.
assert.equal(ip.range('1.2.3.4-10').inetAddresses.length, 3);
assert.notEqual(ip.range('1.2.3.4-10').inetAddresses.indexOf('1.2.3.4/30'), -1);
assert.notEqual(ip.range('1.2.3.4-10').inetAddresses.indexOf('1.2.3.8/31'), -1);
//  Additionally, the result currently includes 1.2.3.10/32, which is redundant

// Non-contiguous ranges need multiple cidr notation ranges
// to specify as well
assert.equal(ip.range('1.2.0-5.0').inetAddresses.length, 6);
assert.notEqual(ip.range('1.2.0-5.0').inetAddresses.indexOf('1.2.0.0/32'), -1);
assert.notEqual(ip.range('1.2.0-5.0').inetAddresses.indexOf('1.2.1.0/32'), -1);
assert.notEqual(ip.range('1.2.0-5.0').inetAddresses.indexOf('1.2.2.0/32'), -1);
assert.notEqual(ip.range('1.2.0-5.0').inetAddresses.indexOf('1.2.3.0/32'), -1);
assert.notEqual(ip.range('1.2.0-5.0').inetAddresses.indexOf('1.2.4.0/32'), -1);
assert.notEqual(ip.range('1.2.0-5.0').inetAddresses.indexOf('1.2.5.0/32'), -1);
