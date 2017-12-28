module.exports = function (test, params) {
    const {
        TransformIterable,
        fromOneToFive,
        twoOneFiveFourThree,
        oneFiveFourThree
    } = params

    test('dropWhile', function (t) {
        t.test('empty array', function (st) {
            const result = new TransformIterable([])
                .dropWhile(() => true)
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('dropWhile some values', function (st) {
            const result = new TransformIterable(twoOneFiveFourThree)
                .dropWhile(e => e % 2 === 0)
            const expected = oneFiveFourThree
            st.deepEqual([...result], [...expected],
                'must iterate over the values while the predicate returns true')
            st.end()
        })
        t.test('dropWhile all', function (st) {
            const result = new TransformIterable(twoOneFiveFourThree)
                .dropWhile(e => e <= 5)
            st.deepEqual([...result], [],
                'must take all of values')
            st.end()
        })
        t.test('dropWhile any', function (st) {
            const result = new TransformIterable(twoOneFiveFourThree)
                .dropWhile(e => e > 5)
            st.deepEqual([...result], [...twoOneFiveFourThree],
                'must not dropWhile any value')
            st.end()
        })
        t.test('chaining', function (st) {
            const result = new TransformIterable(fromOneToFive) // (1 2 3 4 5)
                .dropWhile(e => e === 1) // (2 3 4 5)
                .dropWhile(e => e === 2) // (3 4 5)
                .dropWhile(e => e <= 2) // (3 4 5)
            st.deepEqual([...result], [3, 4, 5],
                'must return the correct value')
            st.end()
        })

        t.test('using intermediate iterables', function (st) {
            const intermediate = new TransformIterable(fromOneToFive)
                .dropWhile(e => e !== 3) // (3 4 5)
            const first = intermediate
                .dropWhile(e => e <= 2) // (3 4 5)
            const second = intermediate
                .dropWhile(e => e % 2 !== 0) // (4 5)
            st.deepEqual([...first], [3, 4, 5],
                'first result must be correct')
            st.deepEqual([...second], [4, 5],
                'second result must be correct')
            st.end()
        })
        t.end()
    })
}
