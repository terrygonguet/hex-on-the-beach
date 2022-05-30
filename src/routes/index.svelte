<script lang="ts">
	import { Game } from "$lib/game"
	import HexGrid from "$lib/HexGrid.svelte"

	const game = new Game({ width: 9, height: 9 })
</script>

<main class="w-screen h-screen overflow-hidden grid place-items-center">
	<HexGrid {game} />
</main>

<style lang="postcss">
	main {
		@apply bg-no-repeat bg-center bg-cover;
		background-image: url("/beach.jpg");
	}
</style>
