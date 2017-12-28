const InmutableArray = require('array-inmutable')

const apply = (a, f) => f(a)
const matches = a => p => p(a)

function applyIfHasNext (next, obj) {
    const status = next()
    if (status.done) {
        return status
    }
    return obj.apply.call(this, status)
}

const methods = {
    drop: slice,
    take: slice,
    slice,
    map () {
        return {
            apply (status) {
                return {
                    value: this.data.reduce(apply, status.value)
                }
            },
            applyIfHasNext
        }
    },
    filter () {
        return {
            apply (status) {
                return this.data.every(matches(status.value)) ? status : undefined
            },
            applyIfHasNext
        }
    },
    dropWhile () {
        let indexDropping = 0
        return {
            apply (status) {
                const {array, length} = this.data
                for (let i = indexDropping; i < length; ++i) {
                    const f = array[i]
                    if (f(status.value)) {
                        return
                    }
                    ++indexDropping
                }
                return status
            },
            applyIfHasNext
        }
    },
    takeWhile () {
        let isTaking = true
        return {
            apply (status) {
                return isTaking && this.data.every(matches(status.value))
                    ? status
                    : (isTaking = false, {done: true})
            },
            applyIfHasNext
        }
    }
}

function slice () {
    let index = 0
    return {
        apply (next) {
            const start = this.data.start
            let result
            if (index >= start + this.data.length) {
                result = {done: true}
            } else if (index >= start) {
                result = next()
            } else {
                next()
            }
            ++index
            return result
        },
        applyIfHasNext (next, obj) {
            return obj.apply.call(this, next, obj)
        }
    }
}

function TransformIterable (iterable) {
    this.iterable = iterable
    this.cs = new InmutableArray([])
}

function addTransform (fn) {
    return createIterable.call(this, this.type, this.data.push(fn), this.cs)
}

function dropTransform (n) {
    if (n <= 0) {
        return this
    }
    const data = this.data
    return createIterable.call(this, this.type, {
        start: data.start + n,
        length: data.length - n
    }, this.cs)
}

function takeTransform (n) {
    const data = this.data
    if (n >= data.length) {
        return this
    }
    return createIterable.call(this, this.type, {
        start: data.start,
        length: n
    }, this.cs)
}

function sliceTransform (start, end) {
    if (start <= 0) {
        return takeTransform.call(this, end)
    } else if (end >= this.data.length) {
        return dropTransform.call(this, start)
    }
    return createIterable.call(this, this.type, {
        start: this.data.start + start,
        length: end - start
    }, this.cs)
}

function initCallbackList (fn) {
    return InmutableArray([fn])
}

function initDrop (n) {
    const start = Math.max(n, 0)
    return {
        start,
        length: this.iterable.length - start
    }
}

function initTake (n) {
    return {
        start: 0,
        length: Math.max(n, 0)
    }
}

function initSlice (start, end) {
    start = Math.max(start, 0)
    return {
        start,
        length: Math.max(end - start, 0)
    }
}

function methodGenerator (methodName, initialize, transform) {
    return function (...args) {
        let type = this.type
        let cs = this.cs
        if (type === methodName) {
            return transform.call(this, ...args)
        }
        const data = initialize.call(this, ...args)
        type = methodName
        if (this.type) {
            cs = cs.push({
                type: this.type,
                data: this.data
            })
        }
        const x = createIterable.call(this, type, data, cs)
        return x
    }
}

function createIterable (type, data, cs) {
    const obj = Object.create(this.constructor.prototype)
    obj.type = type
    obj.data = data
    obj.cs = cs
    obj.iterable = this.iterable
    return obj
}

Object.defineProperties(TransformIterable.prototype, {
    drop: {
        value: methodGenerator('slice', initDrop, dropTransform)
    },
    take: {
        value: methodGenerator('slice', initTake, takeTransform)
    },
    slice: {
        value: methodGenerator('slice', initSlice, sliceTransform)
    },
    map: {
        value: methodGenerator('map', initCallbackList, addTransform)
    },
    filter: {
        value: methodGenerator('filter', initCallbackList, addTransform)
    },
    dropWhile: {
        value: methodGenerator('dropWhile', initCallbackList, addTransform)
    },
    takeWhile: {
        value: methodGenerator('takeWhile', initCallbackList, addTransform)
    },
    [Symbol.iterator]: {
        * value () {
            const cs = this.cs
            const iterable = this.iterable
            const list = cs.reduce((list, c) => {
                const obj = methods[c.type]()
                list.push({
                    data: c.data,
                    fn (next) {
                        return obj.applyIfHasNext.call(c, next, obj)
                    }
                })
                return list
            }, [])
            if (this.type) {
                const obj = methods[this.type]()
                list.push({
                    data: this.data,
                    fn (next) {
                        return obj.applyIfHasNext.call(this, next, obj)
                    }
                })
            }
            if (list.length === 0) {
                for (const value of iterable) {
                    yield value
                }
                return
            }
            const iterator = iterable[Symbol.iterator]()
            while (true) {
                let status
                const next = () => status || (status = iterator.next())
                for (let j = 0; j < list.length; ++j) {
                    status = list[j].fn(next)
                    if (!status) {
                        break
                    } else if (status.done) {
                        return
                    }
                }
                if (status) {
                    yield status.value
                }
            }
        }
    }
})

module.exports = TransformIterable
