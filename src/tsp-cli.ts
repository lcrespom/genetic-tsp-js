import { Population } from './engine';
import { TspEngine, TspParams } from './tsp';


let lastTime = 0

function checkElapsed(elapsed: number): boolean {
	let now = Date.now()
	if (now - lastTime < elapsed) return false
	lastTime = now
	return true
}


let params: TspParams = {
	numCities: 200,
	population: 50,
	elite: 10,
	invertRatio: 0.2,
	weightExponent: 2.0
}
let tsp = new TspEngine(params)
tsp.setListener({
	engineStep(pop: Population, genct: number) {
		if (!checkElapsed(500)) return
		let evl = pop.getIncumbent().evaluate()
		console.log(`Generation: ${genct} - Eval: ${evl.toFixed(2)}`)
	}
})
tsp.run()
