export function arrayWith<T>(length: number, f: (index: number) => T) {
	return Array(length)
		.fill(0)
		.map((_, i) => f(i))
}

export function randInt(min: number, max: number) {
	return min + Math.floor(Math.random() * (max - min))
}

export function randEl<T>(arr: T[]) {
	return arr[randInt(0, arr.length)]
}

export type Maybe<T> = T | undefined

export function* range(min: number, max: number, step = 1) {
	for (let i = min; i < max; i += step) {
		yield i
	}
}

export function rangeArray(min: number, max: number, step = 1) {
	const arr = []
	for (let i = min; i < max; i += step) {
		arr.push(i)
	}
	return arr
}

export function* range2D(maxx: number, maxy: number) {
	for (let x = 0; x < maxx; x++) {
		for (let y = 0; y < maxy; y++) {
			yield { x, y }
		}
	}
}

export function exhaustive(never: never) {
	throw new Error("This should never happen")
}

export function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
