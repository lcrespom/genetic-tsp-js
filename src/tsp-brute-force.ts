import { CountryMap, TspSolution } from './tsp'
declare var process: any


type AnyArray = Array<any>

type PermuteCB = (a: AnyArray) => void

function swap(a: AnyArray, i: number, j: number): void {
	let t = a[i]
	a[i] = a[j]
	a[j] = t
}

function permute(arr: AnyArray, k: number, cb: PermuteCB): void {
	for (let i = k; i < arr.length; i++) {
		swap(arr, i, k)
		permute(arr, k + 1, cb)
		swap(arr, k, i)
	}
	if (k == arr.length - 1) {
		cb(arr)
	}
}

function initArray(length: number): number[] {
	let arr: number[] = []
	for (let i = 0; i < length; i++) arr[i] = i
	return arr
}

function tspBruteForce(numCities: number) {
	let map = new CountryMap(numCities)
	let solution = new TspSolution(map, false)
	let shortestDistance = Number.MAX_VALUE
	permute(initArray(numCities), 1, permutation => {
		solution.setCities(permutation)
		if (solution.evaluate() < shortestDistance) {
			shortestDistance = solution.evaluate()
			console.log(permutation + ' => ' + shortestDistance)
		}
	})
}

function formatElapsedTime(t: number) {
	return new Date(t).toISOString().substr(11, 8)
}

let startTS = Date.now()
tspBruteForce(parseInt(process.argv[2], 10))
console.log('Elapsed time: ' + formatElapsedTime(Date.now() - startTS))

/*
Some data gathered by running this brute force TSP solver on an Intel i7 2.2 GHz:
- Can compute around 20 million permutation tests per second.
	This is for a single CPU core, unoptimized JavaScript.
- An optimized + compiled version of this could be about 10 times faster,
	and a fully parallel version could be 8 times faster. That is 80 times faster,
	but for any amount of cities you just need to add a couple more cities to
	make it comparable.
- 13 cities take 24 seconds
- 15 cities: 1 hour
- 18 cities: 208 days
- 20 cities: 193 years
- 24 cities: 40 million years
- 26 cities: 24 billion years (american billion, 24,000 European million)

So solving a 26 cities TSP by brute force would take almost twice the age
	of the universe.
*/
