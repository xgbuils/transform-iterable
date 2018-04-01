module.exports = function (test, params) {
    const {TransformIterable} = params
    const numberIterable = params.fromOneToFive
    const string = params.fromAToD

    test('slice', function (t) {
        t.test('empty iterable', function (st) {
            const result = new TransformIterable([]).slice(0, 6)
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('negative start', function (st) {
            const result = new TransformIterable(string).slice(-3, 6)
            st.deepEqual([...result], [...string],
                'must be equivalent to start to 0')
            st.end()
        })
        t.test('negative start (toArray)', function (st) {
            const result = new TransformIterable(string).slice(-3, 6)
            st.deepEqual(result.toArray(), [...string],
                'must be equivalent to start to 0')
            st.end()
        })
        t.test('negative end', function (st) {
            const result = new TransformIterable(numberIterable).slice(0, -6)
            st.deepEqual([...result], [],
                'must return empty iterable')
            st.end()
        })
        t.test('out of boundaries: start negative', function (st) {
            const result = new TransformIterable(numberIterable).slice(-1, 8)

            const expected = [...numberIterable].slice(0, 8)
            st.deepEqual([...result], expected,
                'must return the same iterable')
            st.end()
        })
        t.test('out of boundaries: start greater than current length', function (st) {
            const result = new TransformIterable(numberIterable).slice(6, 3)

            const expected = [...numberIterable].slice(6, 3)
            st.deepEqual([...result], expected,
                'must return an empty iterable')
            st.end()
        })
        t.test('out of boundaries: start & length greater than current length', function (st) {
            const result = new TransformIterable(numberIterable).slice(6, 8)

            const expected = [...numberIterable].slice(6, 8)
            st.deepEqual([...result], expected,
                'must return an empty iterable')
            st.end()
        })
        t.test('the same boundaries', function (st) {
            const iterableLength = [...numberIterable].length
            const result = new TransformIterable(numberIterable)
                .slice(0, iterableLength)

            const expected = [...numberIterable].slice(0, iterableLength)
            st.deepEqual([...result], expected,
                'must return the same iterable reference')
            st.end()
        })
        t.test('positive start and end', function (st) {
            const result = new TransformIterable(numberIterable).slice(2, 3)

            const expected = [...numberIterable].slice(2, 3)
            st.deepEqual([...result], expected,
                'must behave like array slice')
            st.end()
        })
        t.test('chaining', function (st) {
            const result = new TransformIterable(numberIterable) // (1 2 3 4 5)
                .slice(1, 4) // (2 3 4)
                .slice(0, 2) // (2 3)
                .slice(1, 6) // (3)
            const expected = [...numberIterable]
                .slice(1, 4)
                .slice(0, 2)
                .slice(1, 6)
            st.deepEqual([...result], expected,
                'must behave like slice with positive starts and ends')
            st.end()
        })

        t.test('using intermediate iterables', function (st) {
            const intermediate = new TransformIterable(numberIterable)
                .slice(0, 4) // (1 2 3 4)
            const first = intermediate.slice(1, 3) // (2 3)
            const second = intermediate.slice(0, 1) // (1)
            const firstExpected = [...numberIterable].slice(0, 4).slice(1, 3)
            const secondExpected = [...numberIterable].slice(0, 4).slice(0, 1)
            st.deepEqual([...first], firstExpected,
                'first result must be correct')
            st.deepEqual([...second], secondExpected,
                'second result must be correct')
            st.end()
        })
        t.end()
    })
}
