import { Population } from './engine'
import { TspEngine, TspParams, CountryMap } from './tsp'


type WorkerPostMessage = (data: any) => void
let wkPostMessage: WorkerPostMessage = <WorkerPostMessage>postMessage

self.onmessage = msg => {
	switch (msg.data.command) {
		case 'start': return doStart(msg.data.params)
		default: throw Error('Unknown command: ' + msg.data.command)
	}
}

function doStart(params) {
	wkPostMessage('Potato')
	let tsp = initTSP(params)
	tsp.setListener({
		engineStep(pop: Population, genct: number) {
			if (!checkElapsed(500)) return
			let incumbent = pop.getIncumbent()
			let status = {
				generation: genct,
				gpm: -1,
				eval: incumbent.evaluate(),
				lastIncumbentGen: -1,
				elapsed: -1,
				lastIncumbentWhen: 0,
				incumbent,
				map: buildCities(tsp.map)
			}
			wkPostMessage(status)
		}
	})
	tsp.run()
}

function initTSP(params): TspEngine {
	let tspParams: TspParams = {
		numCities: 200,
		population: 50,
		elite: 10,
		invertRatio: 0.2,
		weightExponent: 2.0
	}
	return new TspEngine(tspParams)
}

function buildCities(map: CountryMap) {
	let cities = <any>[]
	for (let i = 0; i < map.cityX.length; i++)
		cities.push({ x: map.cityX[i], y: map.cityY[i] })
	return cities
}


let lastTime = 0

function checkElapsed(elapsed: number): boolean {
	let now = Date.now()
	if (now - lastTime < elapsed) return false
	lastTime = now
	return true
}
