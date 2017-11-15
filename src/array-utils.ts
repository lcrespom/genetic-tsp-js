type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray |
	Int16Array | Uint16Array | Int32Array | Uint32Array |
	Float32Array | Float64Array

export function typedArraysEqual(a1: TypedArray, a2: TypedArray): boolean {
	if (a1.length != a2.length) return false
	for (let i = 0; i < a1.length; i++)
		if (a1[i] !== a2[i]) return false
	return true
}
