/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__engine__ = __webpack_require__(1);

// ----- A map of cities and their respective distances -----
class CountryMap {
    constructor(numCities) {
        this.numCities = numCities;
        this.cityX = [];
        this.cityY = [];
        this.initCities(this.cityX, this.cityY);
        this.distances = fillArray(() => new Array(), numCities);
        for (let i = 0; i < numCities; i++)
            for (let j = 0; j < numCities; j++)
                this.distances[i][j] = this.calcDistance(this.cityX[i], this.cityY[i], this.cityX[j], this.cityY[j]);
    }
    getDistance(i, j) {
        return this.distances[i][j];
    }
    initCities(cityX, cityY) {
        if (this.numCities < 100) {
            // Avoid cities from being too close
            let visited = [];
            let visit;
            for (let i = 0; i < this.numCities; i++) {
                do {
                    visit = randomInt(149) + 1;
                } while (visited[visit]);
                visited[visit] = true;
                cityX[i] = 20 + (visit % 15) * 40 + randomInt(10);
                cityY[i] = 30 + (visit / 15) * 40 + randomInt(10);
            }
        }
        else {
            // Just spread cities randomly
            let width = 640;
            let height = 480;
            for (let i = 0; i < this.numCities; i++) {
                cityX[i] = Math.random() * width;
                cityY[i] = Math.random() * height;
            }
        }
    }
    calcDistance(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
/* unused harmony export CountryMap */

// ----- A specific solution sequence for the TSP -----
class TspSolution extends __WEBPACK_IMPORTED_MODULE_0__engine__["b" /* Solution */] {
    constructor(map, initCities = true) {
        super();
        this.map = map;
        this.eval = Number.NEGATIVE_INFINITY;
        this.flags = fillArray(false, map.numCities);
        if (initCities) {
            this.cities = fillArray(-1, map.numCities);
            this.permuteCities();
            this.eval = this.calcTrip();
        }
    }
    evaluate() {
        return this.eval;
    }
    combine(other) {
        let pos = randomInt(this.cities.length);
        let mother = this;
        let father = other;
        let child = this.combineLeft(pos, mother, father);
        child.eval = child.calcTrip();
        let combineResults = [];
        combineResults.push(child);
        child = this.combineRight(pos, mother, father);
        child.eval = child.calcTrip();
        combineResults.push(child);
        return combineResults;
    }
    equals(other) {
        if (this.eval != other.eval)
            return false;
        return arraysEqual(this.cities, other.cities);
    }
    invert() {
        let inverted = new TspSolution(this.map, false);
        inverted.cities = this.cities.slice();
        inverted.cities.reverse();
        inverted.eval = this.eval;
        return inverted;
    }
    // ------------------------------ Privates ------------------------------
    permuteCities() {
        let indexes = [];
        for (let i = 0; i < this.cities.length; i++)
            indexes[i] = i;
        for (let i = 0; i < this.cities.length; i++) {
            let idxSize = this.cities.length - i;
            let pos = randomInt(idxSize);
            this.cities[i] = indexes[pos];
            indexes[pos] = indexes[idxSize - 1];
        }
    }
    combineLeft(pos, mother, father) {
        let child = new TspSolution(this.map, false);
        // Copy left side of mother
        child.cities = mother.cities.slice();
        child.initFlags(mother.cities, 0, pos);
        // Copy not found cities from father starting from right side and wrapping
        let fatherPos = pos;
        let i = 0;
        while (pos < child.cities.length) {
            let cityNum = father.cities[fatherPos];
            if (!child.found(cityNum, 0, pos))
                child.cities[pos++] = cityNum;
            fatherPos++;
            if (fatherPos >= father.cities.length)
                fatherPos = 0;
            i++;
            if (i > father.cities.length)
                throw new Error('Could not combine');
        }
        return child;
    }
    combineRight(pos, mother, father) {
        let child = new TspSolution(this.map, false);
        // Copy right side of mother
        child.cities = mother.cities.slice();
        child.initFlags(mother.cities, pos, mother.cities.length);
        // Copy not found cities from father from beginning
        let fatherPos = 0;
        let i = 0;
        while (i < pos) {
            let cityNum = father.cities[fatherPos];
            if (!child.found(cityNum, pos, child.cities.length))
                child.cities[i++] = cityNum;
            fatherPos++;
            if (fatherPos > father.cities.length)
                throw new Error('Could not combine');
        }
        return child;
    }
    initFlags(cts, pos1, pos2) {
        for (let i = pos1; i < pos2; i++)
            this.flags[cts[i]] = true;
    }
    found(cityNum, pos1, pos2) {
        return this.flags[cityNum];
    }
    calcTrip() {
        let dist = 0;
        for (let i = 0; i < this.cities.length - 1; i++)
            dist += this.map.getDistance(this.cities[i], this.cities[i + 1]);
        dist += this.map.getDistance(this.cities[this.cities.length - 1], this.cities[0]);
        return dist;
    }
}
/* unused harmony export TspSolution */

// ----- TSP Genetic Engine -----
class TspEngine extends __WEBPACK_IMPORTED_MODULE_0__engine__["a" /* Engine */] {
    constructor(params) {
        super(params);
        this.map = new CountryMap(params.numCities);
    }
    newSolution() {
        return new TspSolution(this.map);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = TspEngine;

function fillArray(vf, count) {
    let a = [];
    for (let i = 0; i < count; i++)
        a[i] = vf instanceof Function ? vf() : vf;
    return a;
}
function arraysEqual(a1, a2) {
    return a1.length == a2.length && a1.every((v, i) => v === a2[i]);
}
function randomInt(max) {
    return Math.floor(Math.random() * max);
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ----- A solution is an individual of the population -----
class Solution {
    static compareTo(s1, s2) {
        let ev1 = s1.evaluate(), ev2 = s2.evaluate();
        if (ev1 < ev2)
            return -1;
        if (ev1 > ev2)
            return +1;
        return 0;
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = Solution;

// ----- A population is a set of solutions for a given generation -----
class Population {
    constructor(params) {
        this.numSolutions = params.population;
        this.solutions = [];
        this.weights = [];
        this.weightExponent = params.weightExponent;
    }
    add(sol) {
        this.solutions.push(sol);
    }
    prepareForSelection() {
        this.solutions.sort(Solution.compareTo);
        let max = this.solutions[this.solutions.length - 1].evaluate();
        this.totalWeight = 0;
        for (let i = 0; i < this.numSolutions; i++) {
            let weight = max - this.solutions[i].evaluate();
            if (this.weightExponent != 1.0)
                weight = Math.pow(weight, this.weightExponent);
            this.totalWeight += weight;
            this.weights[i] = this.totalWeight;
        }
    }
    select() {
        let r = Math.random() * this.totalWeight;
        for (let i = 0; i < this.weights.length; i++)
            if (r < this.weights[i])
                return this.solutions[i];
        throw new Error('Invalid population state');
    }
    getIncumbent() {
        return this.solutions[0];
    }
    size() {
        return this.solutions.length;
    }
    hasClone(other) {
        for (let i = 0; i < this.solutions.length; i++)
            if (other.equals(this.solutions[i]))
                return true;
        return false;
    }
    copySolutions(newGen, numSolutions) {
        newGen.solutions = this.solutions.slice(0, numSolutions);
    }
}
/* unused harmony export Population */

// ----- The engine iterates through generations to optimize a solution -----
class Engine {
    constructor(params) {
        this.stop = false;
        this.params = params;
    }
    run() {
        let generationCount = 0;
        this.generation = this.randomize();
        this.generation.prepareForSelection();
        while (!this.stop) {
            this.step();
            generationCount++;
            this.fireStepEvent(this.generation, generationCount);
        }
    }
    setListener(listener) {
        this.listener = listener;
    }
    // -------------------------- Privates --------------------------
    step() {
        let newGen = new Population(this.params);
        this.copyElite(this.generation, newGen);
        this.generation = this.combine(this.generation, newGen);
        while (this.generation.size() < this.params.population)
            this.generation.add(this.newSolution());
        this.generation.prepareForSelection();
    }
    copyElite(oldGen, newGen) {
        oldGen.copySolutions(newGen, this.params.elite);
    }
    combine(oldGen, newGen) {
        let i = this.params.elite;
        let trials = 0;
        while (i < this.params.population && trials < this.params.population * 2) {
            trials++;
            let father = this.generation.select();
            let mother = this.generation.select();
            if (father.equals(mother))
                continue;
            if (Math.random() < this.params.invertRatio)
                father = father.invert();
            let children = father.combine(mother);
            for (let child of children) {
                if (newGen.hasClone(child))
                    continue;
                if (i < this.params.population)
                    newGen.add(child);
                i++;
            }
        }
        return newGen;
    }
    fireStepEvent(pop, generationCount) {
        if (this.listener == null)
            return;
        this.listener.engineStep(pop, generationCount);
    }
    randomize() {
        let generation = new Population(this.params);
        for (let i = 0; i < this.params.population; i++)
            generation.add(this.newSolution());
        return generation;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Engine;



/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(7);


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tsp__ = __webpack_require__(0);

let startTime = 0;
let lastTime = 0;
let lastStepTime = Date.now();
let lastGenct = 0;
let lastIncumbentGen = 0;
let lastIncumbentWhen = 0;
let lastEval = 0;
const REFRESH_WAIT = 250;
let wkPostMessage = postMessage;
self.onmessage = msg => {
    switch (msg.data.command) {
        case 'start': return doStart(msg.data.params);
        default: throw Error('Unknown command: ' + msg.data.command);
    }
};
const engineListener = {
    engineStep(pop, genct) {
        if (!checkElapsed(REFRESH_WAIT))
            return;
        let incumbent = pop.getIncumbent();
        let evl = incumbent.evaluate();
        let now = Date.now();
        let gpm = (genct - lastGenct) / (now - lastStepTime) * 1000 * 60;
        if (evl != lastEval) {
            lastEval = evl;
            lastIncumbentGen = genct;
            lastIncumbentWhen = now - startTime;
        }
        let status = {
            generation: genct,
            gpm,
            eval: evl,
            lastIncumbentGen,
            elapsed: now - startTime,
            lastIncumbentWhen,
            incumbent
        };
        wkPostMessage(status);
        lastGenct = genct;
        lastStepTime = now;
    }
};
function doStart(params) {
    let tsp = initTSP(params);
    tsp.setListener(engineListener);
    startTime = Date.now();
    tsp.run();
}
function initTSP(params) {
    let tspParams = {
        numCities: 200,
        population: 50,
        elite: 10,
        invertRatio: 0.2,
        weightExponent: 2.0
    };
    return new __WEBPACK_IMPORTED_MODULE_0__tsp__["a" /* TspEngine */](tspParams);
}
function checkElapsed(elapsed) {
    let now = Date.now();
    if (now - lastTime < elapsed)
        return false;
    lastTime = now;
    return true;
}


/***/ })
/******/ ]);
//# sourceMappingURL=tsp-worker.js.map