const arrays = require('../js/array-utils')


describe('DoubleQS', () => {
	test('Funny QS works', () => {
		let a = [5, 4, 3, 2, 1]
		let idxs = arrays.doubleQuickSort(a)
		expect(a).toEqual([1, 2, 3, 4, 5])
		expect(idxs.toString()).toBe([4, 3, 2, 1, 0].toString())
	})
})
