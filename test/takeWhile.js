module.exports = function (test, params) {
    const {
        TransformIterable,
        fromOneToFive,
        twoOneFiveFourThree
    } = params

    test('takeWhile', function (t) {
        t.test('empty iterable', function (st) {
            const result = new TransformIterable([])
                .takeWhile(() => true)

            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('takeWhile some values', function (st) {
            const result = new TransformIterable(twoOneFiveFourThree)
                .takeWhile(e => e % 2 === 0)

            const expected = [2]
            st.deepEqual([...result], expected,
                'must iterate over the values while the predicate returns true')
            st.end()
        })
        t.test('takeWhile all', function (st) {
            const result = new TransformIterable(twoOneFiveFourThree)
                .takeWhile(e => e <= 5)

            const expected = [...twoOneFiveFourThree]
            st.deepEqual([...result], expected,
                'must take all of values')
            st.end()
        })
        t.test('takeWhile any', function (st) {
            const result = new TransformIterable(twoOneFiveFourThree)
                .takeWhile(e => e > 5)

            st.deepEqual([...result], [],
                'must not takeWhile any value')
            st.end()
        })
        t.test('chaining', function (st) {
            const result = new TransformIterable(fromOneToFive) // (1 2 3 4 5)
                .takeWhile(e => e !== 5) // (1 2 3 4)
                .takeWhile(e => e !== 4) // (1 2 3)
                .takeWhile(e => e <= 2) // (1 2)
            st.deepEqual([...result], [1, 2],
                'must return the correct value')
            st.end()
        })

        t.test('using intermediate iterables', function (st) {
            const intermediate = new TransformIterable(fromOneToFive)
                .takeWhile(e => e !== 4) // (1 2 3)
            const first = intermediate
                .takeWhile(e => e <= 2) // (1 2)
            const second = intermediate
                .takeWhile(e => e % 2 !== 0) // (1)
            st.deepEqual([...first], [1, 2],
                'first result must be correct')
            st.deepEqual([...second], [1],
                'second result must be correct')
            st.end()
        })
        t.end()
    })
}
