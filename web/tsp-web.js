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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ({

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(5);


/***/ }),

/***/ 5:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["drawSolution"] = drawSolution;
function setupContext() {
    let canvas = document.getElementById('canvas');
    if (!canvas || !canvas.getContext)
        return null;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let w = canvas.width;
    canvas.width = 1;
    canvas.width = w;
    return ctx;
}
function drawCities(ctx, cities) {
    for (let i = 0; i < cities.length; i++)
        ctx.fillRect(cities[i].x - 4, cities[i].y - 4, 8, 8);
}
function drawPath(ctx, cities, path) {
    let city;
    for (let i = 0; i < path.length; i++) {
        city = cities[path[i]];
        if (i == 0)
            ctx.moveTo(city.x, city.y);
        else
            ctx.lineTo(city.x, city.y);
    }
    city = cities[path[0]];
    ctx.lineTo(city.x, city.y);
    ctx.stroke();
}
function buildCities(map) {
    let cities = [];
    for (let i = 0; i < map.cityX.length; i++)
        cities.push({ x: map.cityX[i], y: map.cityY[i] });
    return cities;
}
function drawSolution(sol) {
    let cities = buildCities(sol.map);
    if (cities.length == 0)
        return;
    let ctx = setupContext();
    if (!ctx)
        return;
    ctx.fillStyle = '#00f';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    drawPath(ctx, cities, sol.cities);
    drawCities(ctx, cities);
}
// ------------------------------ Statistics ------------------------------
function formatNum(nStr) {
    nStr += '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(nStr))
        nStr = nStr.replace(rgx, '$1.$2');
    return nStr;
}
function prepend0(num) {
    if (num < 10)
        return '0' + num;
    return num;
}
function formatTime(t) {
    let h, m, s;
    s = Math.round(t / 1000);
    m = Math.floor(s / 60);
    h = Math.floor(m / 60);
    return '' + h + ':' + prepend0(m % 60) + ':' + prepend0(s % 60);
}
function updateStatistics(status) {
    setText('status.generation', formatNum(status.generation));
    setText('status.gpm', formatNum(status.gpm.toFixed(0)));
    setText('status.eval', formatNum(Math.round(status.eval)));
    setText('status.lastIncumbentGen', formatNum(status.lastIncumbentGen));
    setText('status.elapsed', formatTime(status.elapsed));
    setText('status.lastIncumbentWhen', formatTime(status.lastIncumbentWhen));
}
// ------------------------------ Event handling ------------------------------
let but = byId('start') || new HTMLElement();
but.addEventListener('click', evt => {
    let worker = new Worker('tsp-worker.js');
    worker.postMessage({ command: 'start', params: {} });
    let lastEval = 0;
    worker.onmessage = msg => {
        updateStatistics(msg.data);
        if (msg.data.incumbent && msg.data.eval != lastEval) {
            drawSolution(msg.data.incumbent);
            lastEval = msg.data.eval;
        }
    };
    but.hidden = true;
});
// ------------------------------ Utilities ------------------------------
function byId(id) {
    return document.getElementById(id);
}
function setText(id, txt) {
    let elem = byId(id);
    if (!elem)
        return;
    if (elem.tagName == 'INPUT')
        elem.value = txt;
    else
        elem.innerText = txt;
}


/***/ })

/******/ });
//# sourceMappingURL=tsp-web.js.map