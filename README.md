# transform-iterable

[![travis ci][1]][2]
[![npm version][3]][4]
[![Coverage Status][5]][6]
[![Dependency Status][7]][8]

`transform-iterable` exports a class that builds iterables that provide map method.

## Install

``` bash
$ npm install transform-iterable --save
```

## Usage
``` JavaScript
const TransformIterable = require('transform-iterable')

const iterable = new TransformIterable([4, 2, 7, 8]) // (4 2 7 8)
    .map(e => 3 * e) // (12 6 21 24)
    .filter(e => e % 4 !== 1) // (12 6 24)
    .dropWhile(e => e % 12 === 0) // (6 24)
    .takeWhile(e => e <= 12) // (6)



// converting to array:
[...iterable] // [6]

// traversing values:
for (const val of iterable) {
    // ...
}

// creating an iterator that traverses the values
let iterator = iterable[Symbol.iterator]()
iterator.next() // {value: 6, done: false}
iterator.next() // {value: undefined, done: true}
```

## Support
- Node.js >=6
- ES2015 transpilers

## License
MIT

  [1]: https://travis-ci.org/xgbuils/transform-iterable.svg?branch=master
  [2]: https://travis-ci.org/xgbuils/transform-iterable
  [3]: https://badge.fury.io/js/transform-iterable.svg
  [4]: https://badge.fury.io/js/transform-iterable
  [5]: https://coveralls.io/repos/github/xgbuils/transform-iterable/badge.svg?branch=master
  [6]: https://coveralls.io/github/xgbuils/transform-iterable?branch=master
  [7]: https://david-dm.org/xgbuils/transform-iterable.svg
  [8]: https://david-dm.org/xgbuils/transform-iterable
