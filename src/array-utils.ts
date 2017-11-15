type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray |
	Int16Array | Uint16Array | Int32Array | Uint32Array |
	Float32Array | Float64Array

export function typedArraysEqual(a1: TypedArray, a2: TypedArray): boolean {
	if (a1.length != a2.length) return false
	for (let i = 0; i < a1.length; i++)
		if (a1[i] !== a2[i]) return false
	return true
}

export function doubleQuickSort(arr: TypedArray): Int16Array {
	let indexes = new Int16Array(arr.length)
	for (let i = 0; i < indexes.length; i++)
		indexes[i] = i
	doubleQuickSortRecursive(arr, 0, arr.length - 1, indexes)
	return indexes
}

function  doubleQuickSortRecursive(
	arr: TypedArray, left: number, right: number, indexes: Int16Array) {
	let i = left
	let j = right
	let pivotidx = (left + right) / 2
	let pivot = arr[pivotidx.toFixed()]
	// Partition
	while (i <= j) {
		while (arr[i] < pivot) i++
		while (arr[j] > pivot) j--
		if (i <= j) {
			swapInArray(arr, i, j)
			swapInArray(indexes, i, j)
			i++
			j--
		}
	}
	// Recursion
	if (left < j)
		doubleQuickSortRecursive(arr, left, j, indexes)
	if (i < right)
		doubleQuickSortRecursive(arr, i, right, indexes)

}

function swapInArray(arr: TypedArray, i: number, j: number) {
	let tmp = arr[i]
	arr[i] = arr[j]
	arr[j] = tmp
}
