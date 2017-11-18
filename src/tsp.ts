import { Solution, EngineParams, Engine } from './engine'

declare function require(name: string)
const seedrandom = require('seedrandom')


const CITY_MAP_WIDTH = 620
const CITY_MAP_HEIGHT = 460


// ----- TSP Engine Parameters -----
export interface TspParams extends EngineParams {
	numCities: number
	mapSeed?: string
	engineSeed?: string
}


// ----- A map of cities and their respective distances -----
export class CountryMap {
	numCities: number
	distances: number[][]
	cityX: number[]
	cityY: number[]

	constructor(numCities: number) {
		this.numCities = numCities
		this.cityX = []
		this.cityY = []
		this.initCities(this.cityX, this.cityY)
		this.distances = fillArray(() => new Array(), numCities)
		for (let i = 0; i < numCities; i++)
			for (let j = 0; j < numCities; j++)
				this.distances[i][j] = this.calcDistance(
					this.cityX[i], this.cityY[i], this.cityX[j], this.cityY[j])
	}

	getDistance(i: number, j: number): number {
		return this.distances[i][j]
	}

	private initCities(cityX: number[], cityY: number[]): void {
		if (this.numCities < 100) {
			// Avoid cities from being too close
			let visited: boolean[] = []
			let visit
			for (let i = 0; i < this.numCities; i++) {
				do {
					visit = randomInt(149) + 1
				} while (visited[visit])
				visited[visit] = true
				cityX[i] = 20 + (visit % 15) * 40 + randomInt(10)
				cityY[i] = 30 + (visit / 15) * 40 + randomInt(10)
			}
		}
		else {
			// Just spread cities randomly
			for (let i = 0; i < this.numCities; i++) {
				cityX[i] = Math.random() * CITY_MAP_WIDTH
				cityY[i] = Math.random() * CITY_MAP_HEIGHT
			}
		}
	}

	private calcDistance(x1: number, y1: number, x2: number, y2: number): number {
		let dx = x2 - x1
		let dy = y2 - y1
		return Math.sqrt(dx * dx + dy * dy)
	}
}


// ----- A specific solution sequence for the TSP -----
export class TspSolution extends Solution {
	cities: number[]
	map: CountryMap
	eval: number
	flags: boolean[]

	constructor(map: CountryMap, initCities = true) {
		super()
		this.map = map
		this.eval = Number.NEGATIVE_INFINITY
		this.flags = fillArray(false, map.numCities)
		if (initCities) {
			this.cities = fillArray(-1, map.numCities)
			this.permuteCities()
			this.eval = this.calcTrip()
		}
	}

	setCities(cities: number[]) {
		this.cities = cities
		this.eval = this.calcTrip()
	}

	evaluate(): number {
		return this.eval
	}

	combine(other: TspSolution): Solution[] {
		let pos = randomInt(this.cities.length)
		let mother = this
		let father = other
		let child = this.combineLeft(pos, mother, father)
		child.eval = child.calcTrip()
		let combineResults: Solution[] = []
		combineResults.push(child)
		child = this.combineRight(pos, mother, father)
		child.eval = child.calcTrip()
		combineResults.push(child)
		return combineResults
	}

	equals(other: TspSolution): boolean {
		if (this.eval != other.eval)
			return false
		return arraysEqual(this.cities, other.cities)
	}

	invert(): TspSolution {
		let inverted = new TspSolution(this.map, false)
		inverted.cities = this.cities.slice()
		inverted.cities.reverse()
		inverted.eval = this.eval
		return inverted
	}


	// ------------------------------ Privates ------------------------------

	private permuteCities(): void {
		let indexes: number[] = []
		for (let i = 0; i < this.cities.length; i++)
			indexes[i] = i
		for (let i = 0; i < this.cities.length; i++) {
			let idxSize = this.cities.length - i
			let pos = randomInt(idxSize)
			this.cities[i] = indexes[pos]
			indexes[pos] = indexes[idxSize - 1]
		}
	}

	private combineLeft(pos: number, mother: TspSolution, father: TspSolution): TspSolution {
		let child = new TspSolution(this.map, false)
		// Copy left side of mother
		child.cities = mother.cities.slice()
		child.initFlags(mother.cities, 0, pos)
		// Copy not found cities from father starting from right side and wrapping
		let fatherPos = pos
		let i = 0
		while (pos < child.cities.length) {
			let cityNum = father.cities[fatherPos]
			if (!child.found(cityNum, 0, pos))
				child.cities[pos++] = cityNum
			fatherPos++
			if (fatherPos >= father.cities.length)
				fatherPos = 0
			i++
			if (i > father.cities.length)
				throw new Error('Could not combine')
		}
		return child
	}

	private combineRight(pos: number, mother: TspSolution, father: TspSolution): TspSolution {
		let child = new TspSolution(this.map, false)
		// Copy right side of mother
		child.cities = mother.cities.slice()
		child.initFlags(mother.cities, pos, mother.cities.length)
		// Copy not found cities from father from beginning
		let fatherPos = 0
		let i = 0
		while (i < pos) {
			let cityNum = father.cities[fatherPos]
			if (!child.found(cityNum, pos, child.cities.length))
				child.cities[i++] = cityNum
			fatherPos++
			if (fatherPos > father.cities.length)
				throw new Error('Could not combine')
		}
		return child
	}

	private initFlags(cts: number[], pos1: number, pos2: number): void {
		for (let i = pos1; i < pos2; i++)
			this.flags[cts[i]] = true
	}

	private found(cityNum: number, pos1: number, pos2: number): boolean {
		return this.flags[cityNum]
	}

	private calcTrip(): number {
		let dist = 0
		for (let i = 0; i < this.cities.length - 1; i++)
			dist += this.map.getDistance(this.cities[i], this.cities[i + 1])
		dist += this.map.getDistance(
			this.cities[this.cities.length - 1], this.cities[0])
		return dist
	}

}


// ----- TSP Genetic Engine -----
export class TspEngine extends Engine {

	map: CountryMap

	constructor(params: TspParams) {
		super(params)
		let hasMapSeed = params.mapSeed && params.mapSeed.trim().length > 0
		if (hasMapSeed)
			seedrandom(params.mapSeed, { global: true })
		this.map = new CountryMap(params.numCities)
		if (hasMapSeed)
			seedrandom(params.engineSeed, { global: true })
	}

	newSolution(): Solution {
		return new TspSolution(this.map)
	}

}


// -------------------- Utility functions --------------------
type funk<T> = () => T

function fillArray<T>(vf: T | funk<T>, count: number): Array<T> {
	let a: Array<T> = []
	for (let i = 0; i < count; i++)
		a[i] = vf instanceof Function ? vf() : vf
	return a
}

function arraysEqual<T>(a1: Array<T>, a2: Array<T>): boolean {
	return a1.length == a2.length && a1.every((v, i) => v === a2[i])
}

function randomInt(max: number) {
	return Math.floor(Math.random() * max)
}
