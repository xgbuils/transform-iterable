const iterCompose2 = (a, b) => {
    return {
        init () {
            a.init()
            b.init()
        },
        transform (x) {
            const y = b.transform(x)
            return !y || y.done ? y : a.transform(y)
        }
    }
}

const take = n => ({
    init () {
        this.n = n
    },
    transform (s) {
        return this.n-- > 0 ? s : {done: true}
    }
})
const drop = n => ({
    init () {
        this.n = n
    },
    transform (s) {
        return this.n-- > 0 ? undefined : s
    }
})

const fns = {
    map: f => ({
        init () {},
        transform ({value, done}) {
            return {
                value: f(value),
                done
            }
        }
    }),

    filter: f => ({
        init () {},
        transform (s) {
            return s.done || f(s.value) ? s : undefined
        }
    }),

    take,

    drop,

    slice: (start, end) => iterCompose2(take(end - start), drop(start)),

    takeWhile: f => ({
        init () {
            this.taking = true
        },
        transform (s) {
            return this.taking && f(s.value) ? s : (this.taking = false, {done: true})
        }
    }),

    dropWhile: f => ({
        init () {
            this.dropping = true
        },
        transform (s) {
            return this.dropping && !s.done && f(s.value) ? undefined : (this.dropping = false, s)
        }
    })
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
            const fn = this.fn
            if (!fn) {
                return iterator
            }
            fn.init()
            return {
                next () {
                    while (true) {
                        const status = fn.transform(iterator.next())
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
            const fn = this.fn
            if (!fn) {
                return [...this.iterable]
            }
            const iterator = this.iterable[Symbol.iterator]()
            fn.init()
            const array = []
            while (true) {
                const status = fn.transform(iterator.next())
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
