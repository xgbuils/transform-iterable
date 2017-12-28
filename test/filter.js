module.exports = function (test, params) {
    const {TransformIterable} = params
    const iterable = params.fromOneToFive

    test('filter', function (t) {
        t.test('empty array', function (st) {
            const result = new TransformIterable([])
                .filter(() => true)
            st.deepEqual([...result], [],
                'must return an empty iterable')
            st.end()
        })
        t.test('filter some values', function (st) {
            const result = new TransformIterable(iterable)
                .filter(e => e % 2 === 0)
            const expected = [...iterable]
                .filter(e => e % 2 === 0)
            st.deepEqual([...result], expected,
                'must filter the values that predicate returns true')
            st.end()
        })
        t.test('filter all', function (st) {
            const result = new TransformIterable(iterable)
                .filter(e => e <= 5)
            const expected = [...iterable]
            st.deepEqual([...result], expected,
                'must filter all of values')
            st.end()
        })
        t.test('filter any', function (st) {
            const result = new TransformIterable(iterable)
                .filter(e => e > 5)
            st.deepEqual([...result], [],
                'must not filter any value')
            st.end()
        })
        t.test('chaining', function (st) {
            const result = new TransformIterable(iterable) // (1 2 3 4 5)
                .filter(e => e !== 3) // (1 2 4 5)
                .filter(e => e !== 4) // (1 2 5)
                .filter(e => e >= 2) // (2 5)
            st.deepEqual([...result], [2, 5],
                'must behave like Array#filter')
            st.end()
        })

        t.test('using intermediate iterables', function (st) {
            const intermediate = new TransformIterable(iterable)
                .filter(e => e !== 3) // (1 2 4 5)
            const first = intermediate
                .filter(e => e <= 4) // (1 2 4)
            const second = intermediate
                .filter(e => e > 2) // (4 5)
            st.deepEqual([...first], [1, 2, 4],
                'first result must be correct')
            st.deepEqual([...second], [4, 5],
                'second result must be correct')
            st.end()
        })
        t.end()
    })
}
