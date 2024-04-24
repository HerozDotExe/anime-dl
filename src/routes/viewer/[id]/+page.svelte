<script lang="ts">
	import '/node_modules/@picocss/pico/css/pico.min.css';
	import '$lib/viewer.css';
	import { writable, derived } from 'svelte/store';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	const localStorageIdentifier = `lastChapter.${data.id}`;

	let uiChapter = writable(1);
	let chapter = derived(uiChapter, ($uiChapter) => $uiChapter - 1);
	let isReady = false;

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

	function update() {
		if ($chapter > -1 && isReady && $chapter < data.chapters.length) {
			if (isReady) {
				window.scrollTo(0, 0);
				localStorage.setItem(localStorageIdentifier, $uiChapter.toString());
			}
			images = data.chapters[$chapter].map(
				(image) => `/api/image/${data.id}/${$chapter + 1}/${image}`
			);
		}

		if ($chapter > -1 && isReady && $chapter > data.chapters.length) {
			alert("This chapter wasn't downloaded!");
		}
	}

	let images: string[] = [];

	chapter.subscribe(update);

	onMount(() => {
		if (!localStorage.getItem(localStorageIdentifier)) {
			localStorage.setItem(localStorageIdentifier, '1');
		} else {
			$uiChapter = parseInt(localStorage.getItem(localStorageIdentifier)!);
		}
		isReady = true;
		update();
	});
</script>

<nav id="controls">
	<button id="previous" on:click={() => previous()}></button>
	<button id="next" on:click={() => next()}></button>
	<input
		id="chapterSelector"
		type="number"
		min="1"
		max={data.chapters.length}
		bind:value={$uiChapter}
	/>
	<button id="home" on:click={() => (window.location.href = '/')}>Home</button>
</nav>
<main id="viewer">
	<div id="images">
		{#each images as image}
			<img src={image} alt="" />
		{/each}
	</div>
</main>
