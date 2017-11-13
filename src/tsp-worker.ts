import { Population, EngineListener } from './engine'
import { TspEngine, TspParams, CountryMap, TspSolution } from './tsp'

let startTime = 0
let lastTime = 0
let lastStepTime = Date.now()
let lastGenct = 0
let lastIncumbentGen = 0
let lastIncumbentWhen = 0
let lastEval = 0

type WorkerPostMessage = (data: any) => void
let wkPostMessage: WorkerPostMessage = <WorkerPostMessage>postMessage

self.onmessage = msg => {
	switch (msg.data.command) {
		case 'start': return doStart(msg.data.params)
		default: throw Error('Unknown command: ' + msg.data.command)
	}
}

const engineListener: EngineListener = {
	engineStep(pop: Population, genct: number) {
		if (!checkElapsed(500)) return
		let incumbent = <TspSolution>pop.getIncumbent()
		let evl = incumbent.evaluate()
		let now = Date.now()
		let gpm = (genct - lastGenct) / (now - lastStepTime) * 1000 * 60
		if (evl != lastEval) {
			lastEval = evl
			lastIncumbentGen = genct
			lastIncumbentWhen = now - startTime
		}
		let status = {
			generation: genct,
			gpm,
			eval: evl,
			lastIncumbentGen,
			elapsed: now - startTime,
			lastIncumbentWhen,
			incumbent
		}
		wkPostMessage(status)
		lastGenct = genct
		lastStepTime = now
	}
}

function doStart(params) {
	let tsp = initTSP(params)
	tsp.setListener(engineListener)
	startTime = Date.now()
	tsp.run()
}

function initTSP(params): TspEngine {
	let tspParams: TspParams = {
		numCities: 100,
		population: 200,
		elite: 10,
		invertRatio: 0.5,
		weightExponent: 2.0
	}
	return new TspEngine(tspParams)
}


function checkElapsed(elapsed: number): boolean {
	let now = Date.now()
	if (now - lastTime < elapsed) return false
	lastTime = now
	return true
}
