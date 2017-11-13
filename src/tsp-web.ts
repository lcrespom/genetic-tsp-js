import { TspSolution, CountryMap } from './tsp'

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
	for (let i = 0; i < cities.length; i++)
		ctx.fillRect(cities[i].x - 4, cities[i].y - 4, 8, 8)
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
	ctx.fillStyle = '#00f'
	ctx.strokeStyle = '#000'
	ctx.lineWidth = 2
	drawPath(ctx, cities, sol.cities)
	drawCities(ctx, cities)
}


// ------------------------------ Statistics ------------------------------

function formatNum(nStr) {
	nStr += ''
	let rgx = /(\d+)(\d{3})/
	while (rgx.test(nStr))
		nStr = nStr.replace(rgx, '$1' + '.' + '$2')
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

function updateStatistics(status) {
	setText('status.generation', formatNum(status.generation))
	setText('status.gpm', formatNum(status.gpm))
	setText('status.eval', formatNum(Math.round(status.eval)))
	setText('status.lastIncumbentGen', formatNum(status.lastIncumbentGen))
	setText('status.elapsed', formatTime(status.elapsed))
	setText('status.lastIncumbentWhen', formatTime(status.lastIncumbentWhen))
}


// ------------------------------ Event handling ------------------------------

let but = byId('start') || new HTMLElement()
but.addEventListener('click', evt => {
	let worker = new Worker('tsp-worker.js')
	worker.postMessage({ command: 'start', params: {}})
	worker.onmessage = msg => {
		updateStatistics(msg.data)
		if (msg.data.incumbent)
			drawSolution(msg.data.incumbent)
	}
	but.hidden = true
})


// ------------------------------ Utilities ------------------------------

function byId(id: string): HTMLElement | null {
	return document.getElementById(id)
}

function setText(id: string, txt: string) {
	let elem = byId(id)
	if (!elem) return
	elem.innerText = txt
}
