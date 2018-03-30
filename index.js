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
                        const status = fn(iterator.next())
                        if (!status) {
                            continue
                        }
                        return status
                    }
                }
            }
        }
    }
})

module.exports = TransformIterable
