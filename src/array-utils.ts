type funk<T> = () => T
type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray |
	Int16Array | Uint16Array | Int32Array | Uint32Array |
	Float32Array | Float64Array

export function fillArray<T>(vf: T | funk<T>, count: number): Array<T> {
	let a: Array<T> = []
	for (let i = 0; i < count; i++)
		a[i] = vf instanceof Function ? vf() : vf
	return a
}

export function arraysEqual<T>(a1: Array<T>, a2: Array<T>): boolean {
	return a1.length == a2.length && a1.every((v, i) => v === a2[i])
}

export function typedArraysEqual(a1: TypedArray, a2: TypedArray): boolean {
	if (a1.length != a2.length) return false
	for (let i = 0; i < a1.length; i++)
		if (a1[i] !== a2[i]) return false
	return true
}
