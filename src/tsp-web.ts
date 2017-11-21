import { TspSolution, CountryMap, TspParams } from './tsp'
import { TspWorkerStatus } from './tsp-worker'


// ------------------------------ Drawing ------------------------------

const CITY_COLOR = '#343a40'
const SEGMENT_COLOR = '#007bff'
const CITY_SIZE = 3
const SEGMENT_WIDTH = 1.2

type Point = {
	x: number
	y: number
}

type Cities = Point[]


function setupContext(canvasId, clean = true): CanvasRenderingContext2D | null {
	let canvas = <HTMLCanvasElement>document.getElementById(canvasId)
	if (!canvas || !canvas.getContext)
		return null
	let ctx = <CanvasRenderingContext2D>canvas.getContext('2d')
	if (!clean) return ctx
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	let w = canvas.width
	canvas.width = 1
	canvas.width = w
	return ctx
}

function drawCities(ctx: CanvasRenderingContext2D, cities: Cities) {
	for (let i = 0; i < cities.length; i++) {
		ctx.beginPath()
		ctx.arc(cities[i].x, cities[i].y, CITY_SIZE, 0, 2 * Math.PI)
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
	let ctx = setupContext('canvas')
	if (!ctx) return
	ctx.fillStyle = CITY_COLOR
	ctx.strokeStyle = SEGMENT_COLOR
	ctx.lineWidth = SEGMENT_WIDTH
	ctx.translate(10, 10)
	drawPath(ctx, cities, sol.cities)
	drawCities(ctx, cities)
}

let histogramH = 0

function drawHistogram(status: TspWorkerStatus) {
	if (status.elapsed < 1000) return
	if (histogramH == 0)
		histogramH = status.incumbent.eval
	let w = status.elapsed / 1000
	let h = 240 * status.incumbent.eval / histogramH
	let ctx = setupContext('histogram', false)
	if (!ctx) return
	ctx.strokeStyle = SEGMENT_COLOR
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(w, 240)
	ctx.lineTo(w, 240 - h)
	ctx.stroke()
}


// ------------------------------ Statistics ------------------------------

function formatNum(nStr) {
	let n = parseFloat(nStr)
	return n.toLocaleString()
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
	let mapSeed = getInputValue('params.seed')
	if (getNumWorkers() > 1 && mapSeed.trim().length == 0)
		mapSeed = '' + Date.now()
	return {
		numCities: getInputNumValue('params.ncities'),
		population: getInputNumValue('params.popsize'),
		elite: getInputNumValue('params.elite'),
		invertRatio: getInputNumValue('params.invert'),
		weightExponent: getInputNumValue('params.exponent'),
		mapSeed
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
let statuses: TspWorkerStatus[]
let lastStatusData = {
	eval: 0,
	incumbentGen: 0,
	incumbentWhen: 0
}

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

window.addEventListener('load', _ => setupSliders(true))
window.addEventListener('resize', _ => setupSliders(false))

function setupSliders(registerClick: boolean) {
	let sliders = document.getElementsByClassName('slider')
	for (let i = 0; i < sliders.length; i++)
		setupSlider(sliders[i], registerClick)
}

function setupSlider(el: Element, registerClick: boolean) {
	let toggle = el.getElementsByClassName('slider-toggle')[0]
	let slider = <HTMLElement>el.getElementsByClassName('slider-content')[0]
	if (!toggle || !slider) return
	slider.style.maxHeight = ''	// Required to get the default offsetHeight
	slider.style.maxHeight = '' + slider.offsetHeight + 'px'
	if (!registerClick) return
	toggle.addEventListener('click', _ =>
		slider.classList.toggle('slider-closed')
	)
}

// ------------------------------ Worker management ------------------------------

function startWorkers(numWorkers: number) {
	workers = []
	incumbents = []
	statuses = []
	let params = readParamsFromForm()
	for (let i = 0; i < numWorkers; i++)
		workers.push(startWorker(params))
}

function startWorker(params: TspParams): Worker {
	let worker = new Worker('tsp-worker.js')
	worker.postMessage({ command: 'start', params })
	worker.postMessage({ command: 'steps', steps: getEngineSteps() })
	worker.onmessage = msg => {
		switch (msg.data.command) {
			case 'status':
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

function doStatus(stat: TspWorkerStatus) {
	statuses.push(stat)
	if (statuses.length < workers.length) return
	let status = combineStatuses()
	if (status.eval != lastStatusData.eval) {
		drawSolution(status.incumbent)
		drawHistogram(status)
		lastStatusData.eval = status.eval
		lastStatusData.incumbentGen = status.generation
		lastStatusData.incumbentWhen = status.elapsed
	}
	status.lastIncumbentGen = lastStatusData.incumbentGen
	status.lastIncumbentWhen = lastStatusData.incumbentWhen
	updateStatistics(status)
	statuses = []
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

function combineStatuses(): TspWorkerStatus {
	let result = statuses[0]
	for (let i = 1; i < statuses.length; i++) {
		let status = statuses[i]
		if (status.eval < result.eval) {
			result.eval = status.eval
			result.incumbent = status.incumbent
		}
		result.generation += status.generation
		result.gps += status.gps
	}
	result.elapsed = statuses[statuses.length - 1].elapsed
	return result
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
