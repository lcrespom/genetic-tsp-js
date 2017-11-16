# Solving the Traveling Salesman Problem with Genetic Algorithms

## Introduction
There are two kinds of AI:
- Soft (or weak) AI: uses traditional software techniques, more or less based on brute force, to solve very specific problems. As soon as a computer can perform some task using soft AI, it is no longer considered an intelligent task. Example: chess, rule-based expert systems.
- Hard (or strong) AI: tries to solve more general problems using  advanced techniques, usually by imitating nature. For example, deep learning replicates neural networks, neurons and synapses.

Another natural phenomenon worth imitating is evolution:
- Natural evolution is based on natural selection to continuously improve a species to adapt to the environment.
- Genetic Algorithms make use of artificial selection to continuously improve a solution to a problem that is otherwise too hard to solve.

In natural evolution, each individual of a species is determined by a sequence of genes. Each individual adapts better or worse to the environment. Sexual reproduction and mutations alter the sequences of the offspring, resulting in variations of the original individuals that, combined with natural selection of the fittest, gradually become better adapted to the environment.

Genetic algorithms try to solve a problem by representing each solution as a sequence of symbols. The search for an optimal solution starts with a set of random sequences resulting in very bad solutions, then recombines them and selects the best ones for the next generation. The recombination process repeats over and over, and after each generation, the solutions get gradually closer to the optimal. There is no way of knowing whether a solution is the best possible one, so the process runs until the user decides that the best solution so far is good enough to stop, or until the process stabilizes and no new solution is found for a given number of generations.

## The Traveling Salesman Problem (TSP)
Given a list of cities and the distances between each pair of cities, what is the **shortest possible route** that visits each city exactly once and returns to the origin city?

If this problem were to be solved via brute force, i.e. by comparing all possible combinations, it would require measuring and comparing N! routes, where N is the number of cities. This number grows exponentially with the number of cities: with just 20 cities, it requires comparing more than 2 trillion solutions. With 59 cities, it would require comparing 10^80 solutions, approximately the same amount as atoms in the universe.

The TSP is used as an academical representation of other similar problems. For example, a more realistic equivalent problem requires computing the best set of routes for a fleet of vehicles to perform a set of deliveries while minimizing time and fuel consumption.

In order for a problem to be a good candidate to be solved using a genetic algorithm, it must have the following traits:
- Its solutions can be represented as sequences of symbols.
- It must have an evaluation function that provides a numeric score for each sequence, where better solutions correspond to better scores.

The genetic engine will then use the evaluation function to select the best solutions of a given population in order to recombine their sequences and produce the new generation.

## Building and testing
This is a 100% client-side project. You can deploy the web folder anywhere you want and open it from your browser.
- Run `npm run svr` to launch a development server in watch mode. You can then open http://localhost:8080 and play with the application.
- Run `npm run dev` to build a development version, without minification.
- Run `npm run build` to build a production version of the application.

## ToDo
- Look & feel
	- Use Bootstrap
	- Make canvas take window width
- Functionality
	- Stop button
	- Editable parameters
	- Use random with seed, add seed to parameters
		- See https://github.com/davidbau/seedrandom
	- Support parallel engines / recombine in client
