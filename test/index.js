const TransformIterable = require('../')

const test = require('tape')
const tapSpec = require('tap-spec')

const constructor = require('./constructor')
const drop = require('./drop')
const dropWhile = require('./dropWhile')
const filter = require('./filter')
const map = require('./map')
const slice = require('./slice')
const take = require('./take')
const takeWhile = require('./takeWhile')

const methodMixtures = require('./methodMixtures')

const fromAToD = 'abcd'
const fromOneToFive = [1, 2, 3, 4, 5]
const fromOneToSix = [1, 2, 3, 4, 5, 6]
const twoOneFiveFourThree = [2, 1, 5, 4, 3]
const oneFiveFourThree = [1, 5, 4, 3]

const arrayLikeParams = {
    TransformIterable,
    fromAToD,
    fromOneToFive: Object.freeze(fromOneToFive),
    fromOneToSix: Object.freeze(fromOneToSix),
    twoOneFiveFourThree: Object.freeze(twoOneFiveFourThree),
    oneFiveFourThree: Object.freeze(oneFiveFourThree)
}

const iterableParams = {
    TransformIterable,
    fromAToD: new Set(fromAToD),
    fromOneToFive: Object.freeze(new Set(fromOneToFive)),
    fromOneToSix: Object.freeze(new Set(fromOneToSix)),
    twoOneFiveFourThree: Object.freeze(new Set(twoOneFiveFourThree)),
    oneFiveFourThree: Object.freeze(new Set(oneFiveFourThree))
}

const testSuites = [
    constructor,
    drop,
    dropWhile,
    filter,
    map,
    slice,
    take,
    takeWhile,
    methodMixtures
]

test('arraylike iterable', function (t) {
    testSuites.forEach(fn => fn(t.test, arrayLikeParams))
})
test('no arraylike iterable', function (t) {
    testSuites.forEach(fn => fn(t.test, iterableParams))
})

test.createStream()
    .pipe(tapSpec())
    .pipe(process.stdout)
