import { Population, EngineListener } from './engine'
import { TspEngine, TspParams, CountryMap, TspSolution } from './tsp'

// -------------------- Types --------------------

export type TspWorkerStatus = {
	generation: number
	gps: number
	eval: number
	lastIncumbentGen: number
	elapsed: number
	lastIncumbentWhen: number
	incumbent: TspSolution
}

type WorkerPostMessage = (data: any) => void
let wkPostMessage: WorkerPostMessage = <WorkerPostMessage>self.postMessage


// -------------------- Worker scope --------------------

let startTime = 0
let lastTime = 0
let lastStepTime = Date.now()
let lastGenct = 0
let lastIncumbentGen = 0
let lastIncumbentWhen = 0
let lastEval = 0
const REFRESH_WAIT = 250
let tsp: TspEngine


// -------------------- Message handling --------------------

self.onmessage = msg => {
	switch (msg.data.command) {
		case 'start': return doStart(msg.data.params)
		case 'steps': return doSteps(msg.data.steps)
		case 'migrate': return doMigrate(msg.data.solution)
		default: throw Error('Unknown command: ' + msg.data.command)
	}
}

const engineListener = {
	engineStep(pop: Population, genct: number) {
		if (!checkElapsed(REFRESH_WAIT)) return
		let now = Date.now()
		wkPostMessage({
			command: 'status',
			status: getStatus(pop, genct, now)
		})
		lastGenct = genct
		lastStepTime = now
	}
}

function getStatus(pop: Population, genct: number, now: number): TspWorkerStatus {
	let incumbent = <TspSolution>pop.getIncumbent()
	let evl = incumbent.evaluate()
	let gps = (genct - lastGenct) / (now - lastStepTime) * 1000
	if (evl != lastEval) {
		lastEval = evl
		lastIncumbentGen = genct
		lastIncumbentWhen = now - startTime
	}
	return {
		generation: genct,
		gps,
		eval: evl,
		lastIncumbentGen,
		elapsed: now - startTime,
		lastIncumbentWhen,
		incumbent
	}
}

function doStart(params: TspParams) {
	tsp = new TspEngine(params)
	tsp.setListener(engineListener)
	startTime = Date.now()
	tsp.start()
}

function doSteps(numSteps: number) {
	tsp.steps(numSteps)
	wkPostMessage({
		command: 'steps',
		incumbent: tsp.generation.getIncumbent()
	})
}

function doMigrate(solution: TspSolution) {
	let incumbent: TspSolution = <TspSolution>tsp.newSolution()
	incumbent.setCities(solution.cities)
	if (tsp.generation.hasClone(incumbent)) return
	tsp.generation.add(incumbent)
	tsp.generation.prepareForSelection()
}

function checkElapsed(elapsed: number): boolean {
	let now = Date.now()
	if (now - lastTime < elapsed) return false
	lastTime = now
	return true
}
