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
		default: throw Error('Unknown command: ' + msg.data.command)
	}
}

const engineListener = {
	engineStep(pop: Population, genct: number) {
		if (!checkElapsed(REFRESH_WAIT)) return
		let incumbent = <TspSolution>pop.getIncumbent()
		let evl = incumbent.evaluate()
		let now = Date.now()
		let gps = (genct - lastGenct) / (now - lastStepTime) * 1000
		if (evl != lastEval) {
			lastEval = evl
			lastIncumbentGen = genct
			lastIncumbentWhen = now - startTime
		}
		let status: TspWorkerStatus = {
			generation: genct,
			gps,
			eval: evl,
			lastIncumbentGen,
			elapsed: now - startTime,
			lastIncumbentWhen,
			incumbent
		}
		wkPostMessage({ command: 'status', status })
		lastGenct = genct
		lastStepTime = now
	}
}

function doStart(params: TspParams) {
	tsp = new TspEngine(params)
	tsp.setListener(engineListener)
	startTime = Date.now()
	tsp.start()
	// tsp.steps(10000)
	// tsp.run()
}

function doSteps(numSteps: number) {
	tsp.steps(numSteps)
	wkPostMessage({ command: 'steps' })
}


function checkElapsed(elapsed: number): boolean {
	let now = Date.now()
	if (now - lastTime < elapsed) return false
	lastTime = now
	return true
}
