// ----- Engine Parameters -----
export interface EngineParams {
	population: number
	// Elite should be as small as possible
	elite: number
	// Inverting greatly improves quality
	invertRatio: number
	// The higher the weight exponent, the biggest bias towards selecting good solutions
	weightExponent: number
}


// ----- A solution is an individual of the population -----
export abstract class Solution {

	static compareTo(s1: Solution, s2: Solution): number {
		let ev1 = s1.evaluate(), ev2 = s2.evaluate()
		if (ev1 < ev2) return -1
		if (ev1 > ev2) return +1
		return 0
	}

	abstract equals(other: Solution): boolean
	abstract evaluate(): number
	abstract combine(other: Solution): Solution[]
	abstract invert(): Solution
}


// ----- A population is a set of solutions for a given generation -----
export class Population {
	solutions: Solution[]
	weights: number[]
	numSolutions: number
	totalWeight: number
	weightExponent: number

	constructor(params: EngineParams) {
		this.numSolutions = params.population
		this.solutions = []
		this.weights = []
		this.weightExponent = params.weightExponent
	}

	add(sol: Solution): void {
		this.solutions.push(sol)
	}

	prepareForSelection(): void {
		this.solutions.sort(Solution.compareTo)
		let max = this.solutions[this.solutions.length - 1].evaluate()
		this.totalWeight = 0
		for (let i = 0; i < this.numSolutions; i++) {
			let weight = max - this.solutions[i].evaluate()
			if (this.weightExponent != 1.0)
				weight = Math.pow(weight, this.weightExponent)
			this.totalWeight += weight
			this.weights[i] = this.totalWeight
		}
	}

	select(): Solution {
		let r = Math.random() * this.totalWeight
		for (let i = 0; i < this.weights.length; i++)
			if (r < this.weights[i])
				return this.solutions[i]
		throw new Error('Invalid population state')
	}

	getIncumbent(): Solution {
		return this.solutions[0]
	}

	size(): number {
		return this.solutions.length
	}

	hasClone(other: Solution): boolean {
		for (let i = 0; i < this.solutions.length; i++)
			if (other.evaluate() == this.solutions[i].evaluate()) return true
		return false
	}

	copySolutions(newGen: Population, numSolutions: number): void {
		newGen.solutions = this.solutions.slice(0, numSolutions)
	}
}

// ----- The engine listener gets notified when a new generation is created -----
export interface EngineListener {
	engineStep(pop: Population, generationCount: number): void
}


// ----- The engine iterates through generations to optimize a solution -----
export abstract class Engine {
	params: EngineParams
	stop = false
	generation: Population
	listener: EngineListener

	constructor(params: EngineParams) {
		this.params = params
	}

	run(): void {
		let generationCount = 0
		this.generation = this.randomize()
		this.generation.prepareForSelection()
		while (!this.stop) {
			this.step()
			generationCount++
			this.fireStepEvent(this.generation, generationCount)
		}
	}

	setListener(listener: EngineListener): void {
		this.listener = listener
	}

	abstract newSolution():  Solution

	// -------------------------- Privates --------------------------

	private step(): void {
		let newGen = new Population(this.params)
		this.copyElite(this.generation, newGen)
		this.generation = this.combine(this.generation, newGen)
		while (this.generation.size() < this.params.population)
			this.generation.add(this.newSolution())
		this.generation.prepareForSelection()
	}

	private copyElite(oldGen: Population, newGen: Population): void {
		oldGen.copySolutions(newGen, this.params.elite)
	}

	private combine(oldGen: Population, newGen: Population): Population {
		let i = this.params.elite
		let trials = 0
		while (i < this.params.population && trials < this.params.population * 2) {
			trials++
			let father = this.generation.select()
			let mother = this.generation.select()
			if (father.equals(mother)) continue
			if (Math.random() < this.params.invertRatio)
				father = father.invert()
			let children = father.combine(mother)
			for (let child of children) {
				if (newGen.hasClone(child)) continue
				if (i < this.params.population) newGen.add(child)
				i++
			}
		}
		return newGen
	}

	private fireStepEvent(pop: Population, generationCount: number): void {
		if (this.listener == null) return
		this.listener.engineStep(pop, generationCount)
	}

	private randomize(): Population {
		let generation = new Population(this.params)
		for (let i = 0; i < this.params.population; i++)
			generation.add(this.newSolution())
		return generation
	}
}
