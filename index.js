const SKIP = Symbol('SKIP')
const STOP = Symbol('STOP')

const iterCompose2 = (f, g) => () => {
    const tif = f()
    const tig = g()
    return x => {
        const y = tig(x)
        return y === SKIP || y === STOP ? y : tif(y)
    }
}

const take = n => (num = n) => value => num-- > 0 ? value : STOP
const drop = n => (num = n) => value => num-- > 0 ? SKIP : value

const fns = {
    map: f => () => value => value === STOP ? value : f(value),

    filter: f => () => value => value === STOP || f(value) ? value : SKIP,

    take,

    drop,

    slice: (start, end) => iterCompose2(take(end - start), drop(start)),

    takeWhile: f => (taking = true) => {
        return value => taking && value !== STOP && f(value) ? value : (taking = false, STOP)
    },

    dropWhile: f => (dropping = true) => {
        return value => dropping && value !== STOP && f(value) ? SKIP : (dropping = false, value)
    }
}

function TransformIterable (iterable) {
    this.iterable = iterable
}

function methodGenerator (methodName) {
    return function (...args) {
        const g = fns[methodName](...args)
        const fn = this.fn ? iterCompose2(g, this.fn) : g
        const obj = Object.create(this.constructor.prototype)
        obj.fn = fn
        obj.iterable = this.iterable
        return obj
    }
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
            if (!this.fn) {
                return iterator
            }
            const fn = this.fn()
            return {
                next () {
                    while (true) {
                        const s = iterator.next()
                        const value = s.done ? STOP : s.value
                        const newValue = fn(value)
                        if (newValue === STOP) {
                            return {done: true}
                        } else if (newValue !== SKIP) {
                            return {value: newValue}
                        }
                    }
                }
            }
        }
    }
})

module.exports = TransformIterable
