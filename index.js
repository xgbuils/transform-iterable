const arrayOf = require('immutable-array.of')
const push = require('immutable-array.push')
const reduce = require('immutable-array.reduce')

const iterCompose2 = (f, g) => () => {
    const tif = f()
    const tig = g()
    return x => {
        const y = tig(x)
        return !y || y.done ? y : tif(y)
    }
}

const take = n => (num = n) => s => num-- > 0 ? s : {done: true}
const drop = n => (num = n) => s => num-- > 0 ? undefined : s

const fns = {
    map: f => () => ({value, done}) => ({
        value: f(value),
        done
    }),

    filter: f => () => s => s.done || f(s.value) ? s : undefined,

    take,

    drop,

    slice: (start, end) => iterCompose2(take(end - start), drop(start)),

    takeWhile: f => (taking = true) => {
        return s => taking && f(s.value) ? s : (taking = false, {done: true})
    },

    dropWhile: f => (dropping = true) => {
        return s => dropping && !s.done && f(s.value) ? undefined : (dropping = false, s)
    }
}

function TransformIterable (iterable) {
    this.iterable = iterable
    this.transiters = arrayOf([])
}

function methodGenerator (methodName) {
    return function (...args) {
        const obj = Object.create(this.constructor.prototype)
        obj.transiters = push(fns[methodName](...args), this.transiters)
        obj.iterable = this.iterable
        return obj
    }
}

function getTransforms (transiters) {
    return reduce(function (transforms, transiter) {
        transforms.push(transiter())
        return transforms
    }, [], transiters)
}

function applyTransforms (transforms, status) {
    for (let i = 0; i < transforms.length; ++i) {
        status = transforms[i](status)
        if (!status || status.done) {
            return status
        }
    }
    return status
}

Object.defineProperties(TransformIterable.prototype, {
    drop: {
        value: methodGenerator('drop')
    },
    take: {
        value: methodGenerator('take')
    },
    slice: {
        value: methodGenerator('slice')
    },
    map: {
        value: methodGenerator('map')
    },
    filter: {
        value: methodGenerator('filter')
    },
    dropWhile: {
        value: methodGenerator('dropWhile')
    },
    takeWhile: {
        value: methodGenerator('takeWhile')
    },
    [Symbol.iterator]: {
        value () {
            const iterator = this.iterable[Symbol.iterator]()
            const transforms = getTransforms(this.transiters)
            return {
                next () {
                    while (true) {
                        const status = applyTransforms(transforms, iterator.next())
                        if (status) {
                            return status
                        }
                    }
                }
            }
        }
    },
    toArray: {
        value () {
            if (this.transiters.length === 0) {
                return [...this.iterable]
            }
            const iterator = this.iterable[Symbol.iterator]()
            const transforms = getTransforms(this.transiters)
            const array = []
            while (true) {
                const status = applyTransforms(transforms, iterator.next())
                if (status) {
                    if (status.done) {
                        return array
                    }
                    array.push(status.value)
                }
            }
        }
    }
})

module.exports = TransformIterable
