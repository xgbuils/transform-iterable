class Transiter {
    constructor (init, transform) {
        this.init = init
        this.transform = transform
    }
}

const iterCompose2 = (a, b) => {
    return new Transiter(function () {
        a.init()
        b.init()
    }, function (x) {
        const y = b.transform(x)
        return !y || y.done ? y : a.transform(y)
    })
}

class ITake extends Transiter {
    constructor (n) {
        super(function () {
            this.n = n
        }, function (s) {
            return this.n-- > 0 ? s : {done: true}
        })
    }
}

class IDrop extends Transiter {
    constructor (n) {
        super(function () {
            this.n = n
        }, function (s) {
            return this.n-- > 0 ? undefined : s
        })
    }
}

class IMap extends Transiter {
    constructor (f) {
        super(() => {}, function ({value, done}) {
            return {
                value: f(value),
                done
            }
        })
    }
}

class IFilter extends Transiter {
    constructor (f) {
        super(() => {}, function (s) {
            return s.done || f(s.value) ? s : undefined
        })
    }
}

class ITakeWhile extends Transiter {
    constructor (f) {
        super(function () {
            this.taking = true
        }, function (s) {
            return this.taking && f(s.value) ? s : (this.taking = false, {done: true})
        })
    }
}

class IDropWhile extends Transiter {
    constructor (f) {
        super(function () {
            this.dropping = true
        }, function (s) {
            return this.dropping && !s.done && f(s.value) ? undefined : (this.dropping = false, s)
        })
    }
}

const take = n => new ITake(n)
const drop = n => new IDrop(n)

const fns = {
    map: f => new IMap(f),

    filter: f => new IFilter(f),

    take,

    drop,

    slice: (start, end) => iterCompose2(take(end - start), drop(start)),

    takeWhile: f => new ITakeWhile(f),

    dropWhile: f => new IDropWhile(f)
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
