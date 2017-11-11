const tsp = require('../js/tsp')

describe('CountryMap', () => {
	test('Distances', () => {
		const CITIES = 10
		let map = new tsp.CountryMap(CITIES)
		for (let i = 0; i < CITIES; i++) {
			for (let j = 0; j < CITIES; j++) {
				let d1 = map.getDistance(i, j)
				let d2 = map.getDistance(j, i)
				if (i == j) expect(d1).toBe(0)
				else {
					expect(d1).not.toBe(0)
					expect(d1).toBe(d2)
				}
			}
		}
	})
})