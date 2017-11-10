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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

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
        let totalWeight = 0;
        for (let i = 0; i < this.numSolutions; i++) {
            let weight = max - this.solutions[i].evaluate();
            if (this.weightExponent != 1.0)
                weight = Math.pow(weight, this.weightExponent);
            totalWeight += weight;
            this.weights[i] = totalWeight;
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
            if (other.evaluate() == this.solutions[i].evaluate())
                return true;
        return false;
    }
    copySolutions(newGen, numSolutions) {
        newGen.solutions = this.solutions.slice();
    }
}
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


/***/ })
/******/ ]);
//# sourceMappingURL=engine.bundle.js.map