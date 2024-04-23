<script lang="ts">
	import '/node_modules/@picocss/pico/css/pico.min.css';
	import '$lib/viewer.css';
	import { writable, derived } from 'svelte/store';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	let uiChapter = writable(1);
	let chapter = derived(uiChapter, ($uiChapter) => $uiChapter - 1);
	let scrollingEnabled = false

	function previous() {
		$uiChapter--;
		if (!data.chapters[$chapter]) {
			$uiChapter++;
		}
	}

	function next() {
		$uiChapter++;
		if (!data.chapters[$chapter]) {
			$uiChapter--;
		}
	}

	let images: string[] = [];

	$: if (images) {
		if ($chapter > -1) {
			if (scrollingEnabled) {
				window.scrollTo(0, 0);
			}
			images = data.chapters[$chapter].map(
				(image) => `/api/image/${data.id}/${$chapter + 1}/${image}`
			);
		}
	}

	onMount(() => {
		scrollingEnabled = true
	})
</script>

<div id="viewer">
	<div id="controls">
		<button id="previous" on:click={() => previous()}></button>
		<button id="next" on:click={() => next()}></button>
		<input
			id="chapterSelector"
			type="number"
			min="1"
			max={data.chapters.length}
			bind:value={$uiChapter}
		/>
	</div>
	<div id="images">
		{#each images as image}
			<img src={image} alt="" />
		{/each}
	</div>
</div>
