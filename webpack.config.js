const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const PROD = 1, DEV = 2;

function getTarget(env) {
	if (!env.target) {
		console.error('ERROR: no "target" environment found!');
		console.error('       use --env.target=PROD|DEV in webpack command line');
		process.exit(2);
	}
	console.log('Building for target: ' + env.target);
	switch (env.target) {
		case 'PROD': return PROD;
		case 'DEV': return DEV;
		default:
			console.error(`ERROR: invalid target "${env.target}"`);
			process.exit(1);
	}
}

module.exports = function(env) {
	let target = getTarget(env);
	let plugins = [];
	if (target == PROD) {
		plugins = [
			new UglifyJSPlugin()
		];
	}
	return {
		devtool: 'source-map',
		entry: {
			'tsp-cli': ['./src/tsp-cli.ts'],
			//app2: ['./src/app2/main.ts']
		},
		resolve: {
			extensions: ['.webpack.js', '.ts', '.js']
		},
		module: {
			loaders: [{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: '/node_modules'
			}]
		},
		plugins,
		output: {
			path: path.resolve(__dirname, 'web'),
			filename: '[name].js'
		}
	};
}