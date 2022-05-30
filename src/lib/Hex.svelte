<script lang="ts">
	export let x: number
	export let y: number
	export let selected = false
</script>

<button class:selected style="--x:{x};--y:{y}" on:click on:mousedown on:mouseup>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="547.82"
		height="475.68"
		viewBox="0 0 144.944 125.86"
		style="stroke:var(--hex-border-color,#000);fill:none"
		class="w-full h-full"
		><path
			d="M143.694 62.93l-35.611 61.68H36.861L1.25 62.93 36.861 1.25h71.222z"
			stroke-width="4"
			stroke-linejoin="round"
			stroke-miterlimit="10"
		/></svg
	>
</button>

<style lang="postcss">
	button {
		@apply row-span-2 cursor-pointer bg-white bg-opacity-60;
		width: var(--hex-width);
		padding: 0.1rem 0.15rem;
		clip-path: polygon(0% 50%, 25% 100%, 75% 100%, 100% 50%, 75% 0%, 25% 0%);
	}
	.selected {
		--hex-border-color: theme("colors.sky.400");
	}
	.selected:hover {
		background-image: radial-gradient(white, theme("colors.sky.200"));
	}
</style>
