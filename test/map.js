module.exports = function (test, params) {
    const {TransformIterable} = params
    const numberIterable = params.fromOneToFive
    const string = params.fromAToD
    const double = e => e + e
    const half = e => e / 2

    test('map', function (t) {
        t.test('empty array', function (st) {
            const result = new TransformIterable([]).map(double)
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('non-empty string', function (st) {
            const result = new TransformIterable(string).map(double)
            const expected = [...string].map(double)
            st.deepEqual([...result], expected,
                'must return a new iterable with transformed values')
            st.end()
        })
        t.test('non-empty string (toArray)', function (st) {
            const result = new TransformIterable(string).map(double)
            const expected = [...string].map(double)
            st.deepEqual(result.toArray(), expected,
                'must return a new iterable with transformed values')
            st.end()
        })
        t.test('chaining', function (st) {
            const result = new TransformIterable(numberIterable)
                .map(double)
                .map(half)
            st.deepEqual([...result], [...numberIterable],
                'must be possible chain map method')
            st.end()
        })

        t.test('chaining composition rule', function (st) {
            const first = new TransformIterable(numberIterable)
                .map(double)
                .map(double)
            const second = new TransformIterable(numberIterable)
                .map(e => double(double(e)))
            st.deepEqual([...first], [...second],
                'composition rule for map must work')
            st.end()
        })

        t.test('using intermediate iterables', function (st) {
            const intermediate = new TransformIterable(numberIterable)
                .map(double)
            const first = intermediate.map(double)
            const second = intermediate.map(half)
            const firstExpected = [...numberIterable].map(double).map(double)
            const secondExpected = [...numberIterable].map(double).map(half)
            st.deepEqual([...first], firstExpected,
                'first result must be correct')
            st.deepEqual([...second], secondExpected,
                'second result must be correct')
            st.end()
        })
        t.end()
    })
}
