<script lang="ts">
	import '$lib/viewer.css';
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import type { PageData } from './$types';

	export let data: PageData;

	let uiChapter = writable(1);
	let chapter = derived(uiChapter, ($uiChapter) => $uiChapter - 1)

	function previous() {
		$uiChapter--
		if(!data.chapters[$chapter]) {
			$uiChapter++
		}
	}

	function next() {
		$uiChapter++
		if(!data.chapters[$chapter]) {
			$uiChapter--
		}
	}

	let images: string[] = [];

	$: images = data.chapters[$chapter].map((image) => `/api/image/${data.id}/${$chapter+1}/${image}`)
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
