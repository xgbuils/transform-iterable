module.exports = function (test, params) {
    const {TransformIterable} = params
    const iterable = params.fromOneToFive

    test('constructor', function (t) {
        t.test('empty iterable', function (st) {
            const result = new TransformIterable([])
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('non-empty iterable', function (st) {
            const result = new TransformIterable(iterable)
            st.deepEqual([...result], [...iterable],
                'must return an iterable with the same values')
            st.end()
        })

        t.test('empty string', function (st) {
            const result = new TransformIterable('')
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('non-empty typed iterable', function (st) {
            const result = new TransformIterable(new Int8Array(iterable))
            st.deepEqual([...result], [...iterable],
                'must return an iterable with the same values')
            st.end()
        })
        t.end()
    })
}
