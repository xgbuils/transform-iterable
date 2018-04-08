const defaultCompose = function (t) {
    return new Transiter(() => {
        t.init()
        this.init()
    }, x => {
        const y = this.transform(x)
        return !y || y.done ? y : t.transform(y)
    }, t.type, t)
}

const composeMethods = {
    map (t) {
        return new IMap(x => t.f(this.last.f(x)))
    },
    filter (t) {
        return new IFilter(x => t.f(x) && this.last.f(x))
    },
    slice (t) {
        const last = this.last
        const start = last.start + t.start
        const end = Math.min(this.end, last.start + t.end)
        return new ISlice(start, end)
    },
    takeWhile (t) {
        return new ITakeWhile(x => t.f(x) && this.last.f(x))
    }
}

const quickCompose = function (t) {
    const last = this.last
    const compose = composeMethods[last.type]
    const result = (compose || defaultCompose).call(this, t)
    return !compose || this === last
        ? result
        : new Transiter(this.init, this.transform, last.type, result)
}

function Transiter (init, transform, type, last) {
    this.init = init
    this.transform = transform
    this.type = type
    this.last = last || this
}

Transiter.prototype.compose = function (t) {
    return t.last.type === this.type
        ? quickCompose.call(this, t)
        : defaultCompose.call(this, t)
}

function sliceInit () {
    this.m = this.start
    this.n = this.end
}

function sliceTransform (s) {
    if (this.m-- > 0) {
        return undefined
    } else if (this.n-- > this.start) {
        return s
    }
    return {done: true}
}

function ISlice (m, n) {
    Transiter.call(this, sliceInit, sliceTransform, 'slice')
    this.start = m < 0 ? 0 : m
    this.end = n < 0 ? 0 : n
}
ISlice.prototype = Object.create(Transiter.prototype)

function noop () {}

function mapTransform ({value, done}) {
    return {
        value: this.f(value),
        done
    }
}

function IMap (f) {
    Transiter.call(this, noop, mapTransform, 'map')
    this.f = f
}
IMap.prototype = Object.create(Transiter.prototype)

function filterTransform (s) {
    return s.done || this.f(s.value) ? s : undefined
}

function IFilter (f) {
    Transiter.call(this, noop, filterTransform, 'filter')
    this.f = f
}
IFilter.prototype = Object.create(Transiter.prototype)

function takeInit () {
    this.taking = true
}

function takeTransform (s) {
    return this.taking && this.f(s.value) ? s : (this.taking = false, {done: true})
}

function ITakeWhile (f) {
    Transiter.call(this, takeInit, takeTransform, 'takeWhile')
    this.f = f
}
ITakeWhile.prototype = Object.create(Transiter.prototype)

function dropWhileInit () {
    this.dropping = true
}

function dropWhileTransform (s) {
    return this.dropping && !s.done && this.f(s.value) ? undefined : (this.dropping = false, s)
}

function IDropWhile (f) {
    Transiter.call(this, dropWhileInit, dropWhileTransform, 'dropWhile')
    this.f = f
}
IDropWhile.prototype = Object.create(Transiter.prototype)

function TransformIterable (iterable) {
    this.iterable = iterable
}

function methodGenerator (transiter) {
    return function (...args) {
        const g = transiter(...args)
        const fn = this.fn ? this.fn.compose(g) : g
        const obj = Object.create(this.constructor.prototype)
        obj.fn = fn
        obj.iterable = this.iterable
        return obj
    }
}

Object.defineProperties(TransformIterable.prototype, {
    drop: {
        value: methodGenerator(n => new ISlice(n, Infinity))
    },
    take: {
        value: methodGenerator(n => new ISlice(0, n))
    },
    slice: {
        value: methodGenerator((start, end) => new ISlice(start, end))
    },
    map: {
        value: methodGenerator(f => new IMap(f))
    },
    filter: {
        value: methodGenerator(f => new IFilter(f))
    },
    dropWhile: {
        value: methodGenerator(f => new IDropWhile(f))
    },
    takeWhile: {
        value: methodGenerator(f => new ITakeWhile(f))
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
