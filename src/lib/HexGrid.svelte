<script lang="ts">
	import Hex from "$lib/Hex.svelte"
	import { flip } from "svelte/animate"
	import { crossfade } from "svelte/transition"
	import { cubicIn } from "svelte/easing"
	import { rangeArray, wait, type Maybe } from "$lib/utils"
	import { Game, type Gem } from "$lib/game"

	export let game: Game
	export let hexWidth = "6rem"

	const [send, recieve] = crossfade({
		duration: 200,
		easing: cubicIn,
		fallback(node, params, intro) {
			const style = getComputedStyle(node)
			const transform = style.transform === "none" ? "" : style.transform

			return {
				duration: 200,
				easing: cubicIn,
				css: (t, u) =>
					intro
						? `transform: ${transform} translate(0, ${-250 * u}px);
						opacity: ${u};`
						: `transform: ${transform} scale(${t});
						opacity: ${t};`,
			}
		},
	})

	const { grid, gems } = game

	let selected: Maybe<[number, number]>
	let dragStart: Maybe<[number, number]>

	function click(x: number, y: number) {
		return function () {
			if (game.dirty) return
			if (!selected) selected = [x, y]
			else {
				game.move(x, y, ...selected)
				selected = undefined
			}
		}
	}

	function mousedown(x: number, y: number) {
		return function () {
			if (game.dirty) return
			dragStart = [x, y]
		}
	}

	function mouseup(x: number, y: number) {
		return function () {
			if (!dragStart) return
			if (x != dragStart[0] || y != dragStart[1]) game.move(x, y, ...dragStart)
			dragStart = undefined
		}
	}
</script>

<div
	id="hex-grid"
	class="flex relative"
	style="--width:{game.width};--height:{game.height};--hex-width:{hexWidth}"
>
	{#each rangeArray(0, game.width) as x}
		<div class="column" class:shift-left={x > 0} class:shift-down={x % 2}>
			{#each rangeArray(0, game.height) as y}
				<Hex
					{x}
					{y}
					selected={selected && Game.isValidMove(...selected, x, y)}
					on:click={click(x, y)}
					on:mousedown={mousedown(x, y)}
					on:mouseup={mouseup(x, y)}
				/>
			{/each}
		</div>
	{/each}
	{#each $gems as gem (gem.id)}
		{@const { id, x, y } = gem}
		<div
			in:recieve={{ key: id }}
			out:send={{ key: id }}
			animate:flip={{ duration: 300 }}
			class="cell {gem.type.bg}"
			style="--x:{x};--y:{y};--odd:{x % 2 ? 1 : 0}"
		>
			<div class="sprite {gem.type.sprite}" />
		</div>
	{/each}
</div>

<style lang="postcss">
	.column {
		@apply flex flex-col;
	}
	.shift-left {
		margin-left: calc(-1 / 4 * var(--hex-width));
	}
	.shift-down {
		margin-top: calc(0.4285 * var(--hex-width));
	}

	.cell {
		@apply absolute grid place-items-center pointer-events-none rounded-full;
		width: calc(0.6 * var(--hex-width));
		aspect-ratio: 1;
		transform: translate(
			calc((0.75 * var(--x) + 0.5) * var(--hex-width) - 50%),
			calc((var(--y) + 0.5 + var(--odd) * 0.5) * (var(--hex-width) * 0.857) - 50%)
		);
	}
	.sprite {
		image-rendering: pixelated;
		transform: scale(2);
	}
</style>
