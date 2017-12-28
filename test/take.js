module.exports = function (test, params) {
    const {TransformIterable} = params
    const numberIterable = params.fromOneToSix
    const string = params.fromAToD

    test('take', function (t) {
        t.test('empty iterable', function (st) {
            const result = new TransformIterable([]).take(2)
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('negative take', function (st) {
            const result = new TransformIterable(string).take(-2)
            st.deepEqual([...result], [],
                'must be equivalent to taking 0 elements')
            st.end()
        })
        t.test('take more elements than iterable has', function (st) {
            const result = new TransformIterable(numberIterable).take(8)

            const expected = [...numberIterable]
            st.deepEqual([...result], expected, 'must return the same iterable')
            st.end()
        })
        t.test('take the same elements as iterable has', function (st) {
            const result = new TransformIterable(numberIterable)
                .take([...numberIterable].length)

            const expected = [...numberIterable]
            st.deepEqual([...result], expected, 'must return the same iterable')
            st.end()
        })
        t.test('take some elements', function (st) {
            const result = new TransformIterable(numberIterable).take(2)

            const expected = [...numberIterable].slice(0, 2)
            st.deepEqual([...result], expected, 'must behave like array slice')
            st.end()
        })
        t.test('chaining', function (st) {
            const result = new TransformIterable([...numberIterable]) // (1 2 3 4 5 6)
                .take(5) // (2 3 4 5 6)
                .take(3) // (4 5 6)
                .take(4) // (4 5 6)
            const expected = [...numberIterable]
                .slice(0, 5)
                .slice(0, 3)
                .slice(0, 4)
            st.deepEqual([...result], expected,
                'must behave like slice with positive starts and ends')
            st.end()
        })

        t.test('using intermediate iterables', function (st) {
            const intermediate = new TransformIterable(numberIterable)
                .take(4) // (1 2 3 4)
            const first = intermediate.take(2) // (1 2)
            const second = intermediate.take(3) // (1 2 3)
            const firstExpected = [...numberIterable].slice(0, 4).slice(0, 2)
            const secondExpected = [...numberIterable].slice(0, 4).slice(0, 3)
            st.deepEqual([...first], firstExpected,
                'first result must be correct')
            st.deepEqual([...second], secondExpected,
                'second result must be correct')
            st.end()
        })
        t.end()
    })
}
