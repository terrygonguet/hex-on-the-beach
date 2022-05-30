import { type Maybe, arrayWith, randEl, range, range2D, exhaustive, wait } from "$lib/utils"
import { derived, writable } from "svelte/store"

export type Gem = {
	id: number
	type: GemType
	x: number
	y: number
}

enum Direction {
	South,
	NorthEast,
	SouthEast,
}
interface GameOptions {
	width: number
	height: number
}

export class Game {
	width: number
	height: number
	dirty = true

	grid = writable<Maybe<Gem>[][]>([])
	gems = derived(this.grid, grid => grid.flat().filter(Boolean) as Gem[])

	constructor({ width, height }: GameOptions) {
		this.width = width
		this.height = height
		this.grid.set(arrayWith(width, x => arrayWith(height, y => Game.createGem(x, y))))
		this.resolve(false)
	}

	swap(x1: number, y1: number, x2: number, y2: number) {
		this.grid.update(grid => {
			const temp = grid[x1][y1]
			Game.set(grid, x1, y1, grid[x2][y2])
			Game.set(grid, x2, y2, temp)
			this.dirty = x1 != x2 || y1 != y2
			return grid.slice()
		})
	}

	match() {
		const matches: [number, number, Direction, number][] = []
		this.grid.update(grid => {
			for (const { x, y } of range2D(this.width, this.height)) {
				const gem = grid[x][y]
				if (!gem) continue
				const cur = gem.type

				// |
				if (y <= this.height - 3) {
					let l = 1
					while (grid[x][y + l]?.type == cur) l++
					if (l >= 3) matches.push([x, y, Direction.South, l])
				}

				// /
				if (x <= this.width - 3) {
					let curx = x
					let cury = y
					let l = 0
					let other: Maybe<Gem> = gem
					while (other?.type == cur) {
						l++
						if (curx % 2 == 0) cury--
						curx++
						other = grid[curx]?.[cury]
					}
					if (l >= 3) matches.push([x, y, Direction.NorthEast, l])
				}

				// \
				if (x <= this.width - 3) {
					let curx = x
					let cury = y
					let l = 0
					let other: Maybe<Gem> = gem
					while (other?.type == cur) {
						l++
						if (curx % 2 == 1) cury++
						curx++
						other = grid[curx]?.[cury]
					}
					if (l >= 3) matches.push([x, y, Direction.SouthEast, l])
				}
			}
			return grid.slice()
		})

		// TODO: remove ovelaps
		return matches
	}

	clear(x: number, y: number, direction: Direction, length: number) {
		this.dirty = true
		this.grid.update(grid => {
			switch (direction) {
				case Direction.South:
					for (const n of range(0, length)) {
						grid[x][y + n] = undefined
					}
					break
				case Direction.NorthEast: {
					let curx = x
					let cury = y
					for (const n of range(0, length)) {
						grid[curx][cury] = undefined
						if (curx % 2 == 0) cury--
						curx++
					}
					break
				}
				case Direction.SouthEast: {
					let curx = x
					let cury = y
					for (const n of range(0, length)) {
						grid[curx][cury] = undefined
						if (curx % 2 == 1) cury++
						curx++
					}
					break
				}
				default:
					exhaustive(direction)
					break
			}
			return grid.slice()
		})
	}

	fall() {
		this.grid.update(grid => {
			for (const x of range(0, grid.length)) {
				const col = grid[x]
				const filtered = col.filter(cell => !!cell) as Gem[]
				if (filtered.length != col.length) this.dirty = true
				const delta = this.height - filtered.length
				grid[x] = [...arrayWith(delta, y => Game.createGem(x, y)), ...filtered]
				filtered.forEach((gem, i) => (gem.y = i + delta))
			}
			return grid.slice()
		})
	}

	async resolve(async = true) {
		while (this.dirty) {
			this.dirty = false
			const matches = this.match()
			for (const match of matches) {
				this.clear(...match)
			}
			if (async) await wait(400)
			this.fall()
			if (async) await wait(500)
		}
	}

	async move(x1: number, y1: number, x2: number, y2: number) {
		if (!Game.isValidMove(x1, y1, x2, y2)) return
		this.swap(x1, y1, x2, y2)
		await wait(500)
		const matches = this.match()
		if (matches.length == 0) {
			this.swap(x1, y1, x2, y2)
			this.dirty = false
			await wait(500)
		} else await this.resolve()
	}

	static set(grid: Maybe<Gem>[][], x: number, y: number, value: Maybe<Gem>) {
		grid[x][y] = value
		if (value) {
			value.x = x
			value.y = y
		}
	}

	static isValidMove(x1: number, y1: number, x2: number, y2: number) {
		if (x1 == x2) return Math.abs(y1 - y2) <= 1
		else if (Math.abs(x1 - x2) <= 1)
			return y1 == y2 || (x1 % 2 == 1 ? y1 == y2 - 1 : y1 == y2 + 1)
	}

	static curId = 1
	static createGem(x: number, y: number): Gem {
		return {
			id: Game.curId++,
			x,
			y,
			type: randEl([
				GemType.orca,
				GemType.dolphins,
				GemType.conch,
				GemType.spiral,
				GemType.jelly,
				GemType.angler,
				GemType.pearl,
			]),
		}
	}
}

interface GemTypeOptions {
	bg: string
	sprite: string
}
class GemType {
	bg: string
	sprite: string

	static orca = new GemType({ bg: "bg-zinc-300", sprite: "sprite-orca" })
	static dolphins = new GemType({ bg: "bg-red-200", sprite: "sprite-dolphins" })
	static conch = new GemType({ bg: "bg-[#f9c79d]", sprite: "sprite-conch" })
	static spiral = new GemType({ bg: "bg-yellow-200", sprite: "sprite-spiral" })
	static jelly = new GemType({ bg: "bg-fuchsia-200", sprite: "sprite-jelly" })
	static angler = new GemType({ bg: "bg-green-200", sprite: "sprite-angler" })
	static pearl = new GemType({ bg: "bg-blue-200", sprite: "sprite-pearl" })

	private constructor({ bg, sprite }: GemTypeOptions) {
		this.bg = bg
		this.sprite = sprite
	}
}
