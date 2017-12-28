module.exports = function (test, params) {
    const {TransformIterable} = params
    const numberIterable = params.fromOneToSix
    const charIterable = params.fromAToD

    test('drop', function (t) {
        t.test('empty array', function (st) {
            const result = new TransformIterable([]).drop(5)
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('negative drop', function (st) {
            const result = new TransformIterable(charIterable).drop(-2)
            st.deepEqual([...result], [...charIterable],
                'must be equivalent to dropping 0 elements')
            st.end()
        })
        t.test('drop more elements than iterable has', function (st) {
            const result = new TransformIterable(numberIterable).drop(8)
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('drop the same elements as iterable has', function (st) {
            const result = new TransformIterable(numberIterable)
                .drop([...numberIterable].length)
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('drop some elements', function (st) {
            const result = new TransformIterable(numberIterable).drop(2)
            const expected = [...numberIterable].slice(2)
            st.deepEqual([...result], expected,
                'must behave like array slice')
            st.end()
        })
        t.test('chaining', function (st) {
            const result = new TransformIterable(numberIterable) // (1 2 3 4 5 6)
                .drop(1) // (2 3 4 5 6)
                .drop(2) // (4 5 6)
                .drop(1) // (5 6)
            const expected = [...numberIterable]
                .slice(1)
                .slice(2)
                .slice(1)
            st.deepEqual([...result], expected,
                'must behave like slice without second parameters')
            st.end()
        })

        t.test('chaining with negative parameter', function (st) {
            const result = new TransformIterable(numberIterable) // (1 2 3 4 5 6)
                .drop(1) // (2 3 4 5 6)
                .drop(-2) // (2 3 4 5 6)
            const expected = [...numberIterable]
                .slice(1)
                .slice(0)
            st.deepEqual([...result], expected,
                'negative parameter must be considered as 0 value')
            st.end()
        })

        t.test('using intermediate iterables', function (st) {
            const intermediate = new TransformIterable(numberIterable)
                .drop(2) // (3 4 5 6)
            const first = intermediate.drop(1) // (4 5 6)
            const second = intermediate.drop(3) // (6)
            const firstExpected = [...numberIterable].slice(2).slice(1)
            const secondExpected = [...numberIterable].slice(2).slice(3)
            st.deepEqual([...first], firstExpected,
                'first result must be correct')
            st.deepEqual([...second], secondExpected,
                'second result must be correct')
            st.end()
        })
        t.end()
    })
}
