const tsp = require('../js/tsp')
const CITIES = 20


describe('CountryMap', () => {
	test('Distances are correct', () => {
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

describe('TspSolution', () => {
	test('Each city appears only once', () => {
		let map = new tsp.CountryMap(CITIES)
		let sol = new tsp.TspSolution(map)
		for (let i = 0; i < CITIES; i++) {
			expect(arrayCount(sol.cities, i)).toBe(1)
		}
	})
	test('Invert works', () => {
		let map = new tsp.CountryMap(CITIES)
		let sol = new tsp.TspSolution(map)
		let inv = sol.invert()
		expect(sol.eval).toBe(inv.eval)
		inv.cities.reverse()
		expect(arraysEqual(sol, inv)).toBe(true)
	})
})


function arrayCount(a, v) {
	return a.reduce((count, item) => item === v ? count + 1 : count, 0)
}

function arraysEqual(a1, a2) {
	if (a1.length != a2.length)
		return false
	for (let i = 0; i < a1.length; i++)
		if (a1[i] !== a2[i]) return false
	return true
}
