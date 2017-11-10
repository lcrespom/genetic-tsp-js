interface EngineParams {
	population: number
	// Elite should be as small as possible
	elite: number
	// Inverting greatly improves quality
	invertRatio: number
	// The higher the weight exponent, the biggest bias towards selecting good solutions
	weightExponent: number
}


abstract class Solution {

	static compareTo(s1: Solution, s2: Solution): number {
		let ev1 = s1.evaluate(), ev2 = s2.evaluate()
		if (ev1 < ev2) return -1
		if (ev1 > ev2) return +1
		return 0
	}

	abstract evaluate(): number
	abstract combine(other: Solution): Solution[]
	abstract invert(): Solution
}

class Population {
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
		let totalWeight = 0
		for (let i = 0; i < this.numSolutions; i++) {
			let weight = max - this.solutions[i].evaluate()
			if (this.weightExponent != 1.0)
				weight = Math.pow(weight, this.weightExponent)
			totalWeight += weight
			this.weights[i] = totalWeight
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
		newGen.solutions = this.solutions.slice()
	}
}

interface EngineListener {
	engineStep(pop: Population, generationCount: number): void
}

class Engine {
	params: EngineParams
	stop = false
	generation: Population
	listener: EngineListener
}
