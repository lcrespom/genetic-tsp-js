import { TspSolution, CountryMap, TspParams } from './tsp'
import { TspWorkerStatus } from './tsp-worker'

// ------------------------------ Drawing ------------------------------

type Point = {
	x: number
	y: number
}

type Cities = Point[]


function setupContext(): CanvasRenderingContext2D | null {
	let canvas = <HTMLCanvasElement>document.getElementById('canvas')
	if (!canvas || !canvas.getContext)
		return null
	let ctx = <CanvasRenderingContext2D>canvas.getContext('2d')
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	let w = canvas.width
	canvas.width = 1
	canvas.width = w
	return ctx
}

function drawCities(ctx: CanvasRenderingContext2D, cities: Cities) {
	for (let i = 0; i < cities.length; i++) {
		ctx.beginPath()
		ctx.arc(cities[i].x, cities[i].y, 4, 0, 2 * Math.PI)
		ctx.fill()
	}
}

function drawPath(ctx: CanvasRenderingContext2D, cities: Cities, path: number[]) {
	let city
	for (let i = 0; i < path.length; i++) {
		city = cities[path[i]]
		if (i == 0) ctx.moveTo(city.x, city.y)
		else ctx.lineTo(city.x, city.y)
	}
	city = cities[path[0]]
	ctx.lineTo(city.x, city.y)
	ctx.stroke()
}

function buildCities(map: CountryMap): Cities {
	let cities: Cities = []
	for (let i = 0; i < map.cityX.length; i++)
		cities.push({ x: map.cityX[i], y: map.cityY[i] })
	return cities
}

export function drawSolution(sol: TspSolution) {
	let cities = buildCities(sol.map)
	if (cities.length == 0) return
	let ctx = setupContext()
	if (!ctx) return
	ctx.fillStyle = '#000'
	ctx.strokeStyle = '#337AB7'
	ctx.lineWidth = 2
	ctx.translate(10, 10)
	drawPath(ctx, cities, sol.cities)
	drawCities(ctx, cities)
}


// ------------------------------ Statistics ------------------------------

function formatNum(nStr) {
	nStr += ''
	let rgx = /(\d+)(\d{3})/
	while (rgx.test(nStr))
		nStr = nStr.replace(rgx, '$1.$2')
	return nStr
}

function prepend0(num) {
	if (num < 10) return '0' + num
	return num
}

function formatTime(t: number) {
	let h, m, s
	s = Math.round(t / 1000)
	m = Math.floor(s / 60)
	h = Math.floor(m / 60)
	return '' + h + ':' + prepend0(m % 60) + ':' + prepend0(s % 60)
}

function updateStatistics(status: TspWorkerStatus) {
	setText('status.generation', formatNum(status.generation))
	setText('status.gps', formatNum(status.gps.toFixed(0)))
	setText('status.eval', formatNum(Math.round(status.eval)))
	setText('status.lastIncumbentGen', formatNum(status.lastIncumbentGen))
	setText('status.elapsed', formatTime(status.elapsed))
	setText('status.lastIncumbentWhen', formatTime(status.lastIncumbentWhen))
}

function readParamsFromForm(): TspParams {
	return {
		numCities: getInputNumValue('params.ncities'),
		population: getInputNumValue('params.popsize'),
		elite: getInputNumValue('params.elite'),
		invertRatio: getInputNumValue('params.invert'),
		weightExponent: getInputNumValue('params.exponent'),
		mapSeed: getInputValue('params.seed')
	}
}

function getEngineSteps(): number {
	return getInputNumValue('params.migration') || 10000
}

function getNumWorkers(): number {
	return getInputNumValue('params.nworkers') || 1
}


// ------------------------------ Event handling ------------------------------

let started = false
let workers: Worker[]
let incumbents: TspSolution[]
let lastEval = 0

let but = byId('start') || new HTMLElement()
but.addEventListener('click', evt => {
	if (started) {
		for (let worker of workers)
			worker.terminate()
		but.innerText = 'Start'
	}
	else {
		startWorkers(getNumWorkers())
		but.innerText = 'Stop'
	}
	started = !started
})


// ------------------------------ Worker management ------------------------------

function startWorkers(numWorkers: number) {
	workers = []
	incumbents = []
	for (let i = 0; i < numWorkers; i++)
		workers.push(startWorker(i == 0))
}

function startWorker(showStatus: boolean): Worker {
	let worker = new Worker('tsp-worker.js')
	worker.postMessage({ command: 'start', params: readParamsFromForm() })
	worker.postMessage({ command: 'steps', steps: getEngineSteps() })
	worker.onmessage = msg => {
		switch (msg.data.command) {
			case 'status':
				// ToDo: combine all status into one
				if (showStatus)
					doStatus(msg.data.status)
				break
			case 'steps':
				doSteps(worker, msg.data.incumbent)
				break
			default: throw Error('Unknown command: ' + msg.data.command)
		}
	}
	return worker
}

function doStatus(status: TspWorkerStatus) {
	updateStatistics(status)
	if (status.incumbent && status.eval != lastEval) {
		drawSolution(status.incumbent)
		lastEval = status.eval
	}
}

function doSteps(worker: Worker, incumbent: TspSolution) {
	incumbents.push(incumbent)
	if (incumbents.length >= workers.length)
		migrateIncumbent()
	worker.postMessage({
		command: 'steps',
		steps: getEngineSteps()
	})
}

function migrateIncumbent() {
	let winner = incumbents[0]
	for (let incumbent of incumbents) {
		if (incumbent.eval < winner.eval)
			winner = incumbent
	}
	incumbents = []
	for (let worker of workers) {
		worker.postMessage({
			command: 'migrate',
			solution: winner
		})
	}
}

// ------------------------------ Utilities ------------------------------

function byId(id: string): HTMLElement | null {
	return document.getElementById(id)
}

function setText(id: string, txt: string) {
	let elem = byId(id)
	if (!elem) return
	if (elem.tagName == 'INPUT')
		(<HTMLInputElement>elem).value = txt
	else
		elem.innerText = txt
}

function getInputValue(id: string, deflt = ''): string {
	let elem = byId(id)
	if (!elem) return deflt
	if (elem.tagName == 'INPUT')
		return (<HTMLInputElement>elem).value
	else
		return deflt
}

function getInputNumValue(id: string): number {
	let v = getInputValue(id, '0')
	return parseFloat(v)
}
