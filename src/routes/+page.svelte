<script lang="ts">
	import '/node_modules/@picocss/pico/css/pico.min.css';
	import '$lib/main.css';
	import type { ActionData } from './$types';
	import { pending } from '$lib/stores';
	import { onMount } from 'svelte';
	import type { Library } from '$lib/utils';

	export let form: ActionData;

	let downloaderDialog: HTMLDialogElement;
	let linkInput: HTMLInputElement;
	let fromInput: HTMLInputElement;
	let toInput: HTMLInputElement;

	let library: Library = {};

	// Error occured at form validation
	$: if (form?.err) {
		if (linkInput && fromInput && toInput) {
			linkInput.value = form.formData.link || '';
			switch (form.err) {
				case 'Please specify a link !':
				case 'Invalid link ! Here is an example: https://anime-sama.fr/catalogue/jujutsu-kaisen/scan/vf/':
					linkInput.ariaInvalid = 'true';
					break;
				case 'Please specify from which chapter you want to download !':
					fromInput.ariaInvalid = 'true';
					break;
				case 'Please specify to which chapter you want to download !':
					toInput.ariaInvalid = 'true';
					break;
				case 'From must be greater than to.':
				case 'From must be less than to.':
					fromInput.ariaInvalid = 'true';
					toInput.ariaInvalid = 'true';
					break;
				default:
					console.error(form);
			}
			if (
				form.err === 'Please specify a link !' ||
				form.err ===
					'Invalid link ! Here is an example: https://anime-sama.fr/catalogue/jujutsu-kaisen/scan/vf/'
			) {
				linkInput.ariaInvalid = 'true';
			}
			if (form.err === 'Please specify from which chapter you want to download !') {
				fromInput.ariaInvalid = 'true';
			}
			if (form.err === 'Please specify to which chapter you want to download !') {
				toInput.ariaInvalid = 'true';
			}
			if (
				form.err === 'From must be greater than to.' ||
				form.err === 'From must be less than to.'
			) {
				fromInput.ariaInvalid = 'true';
				toInput.ariaInvalid = 'true';
			}
			fromInput.value = form.formData.from || '';
			toInput.value = form.formData.to || '';
		}
		downloaderDialog?.showModal();
	}

	async function refreshMangas() {
		$pending = (await (await fetch('/api/tasks')).json()) as {
			id: string;
			progress: string;
		}[];

		library = await (await fetch('/api/library')).json();
	}

	async function cancelTask(id: number) {
		console.log('cancel', id);
		await fetch(`/api/cancel/${id}`);
	}

	async function deleteManga(id: string) {
		console.log('delete', id);
		await fetch(`/api/delete/${id}`);
	}

	onMount(() => {
		refreshMangas();
		setInterval(refreshMangas, 500);
	});
</script>

<header class="container">
	<nav>
		<ul>
			<li><strong>Anime DL</strong></li>
		</ul>
		<ul>
			<!-- svelte-ignore a11y-missing-attribute -->
			<li>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<a
					on:click={() => {
						downloaderDialog.showModal();
					}}>Downloader</a
				>
			</li>
		</ul>
	</nav>
</header>

<dialog bind:this={downloaderDialog}>
	<article>
		<header>
			<button
				aria-label="Close"
				rel="prev"
				on:click={() => {
					downloaderDialog.close();
				}}
			></button>
			<p>
				<strong>Downloader</strong>
			</p>
		</header>
		<main>
			<form method="POST">
				{#if form?.err}
					<p style="color: red;">{form.err}</p>
				{/if}
				<fieldset>
					<label>
						Link
						<input
							bind:this={linkInput}
							name="link"
							placeholder="https://anime-sama.fr/catalogue/NOM/scan/vf/"
						/>
					</label>
					<label>
						From chapter
						<input
							value="1"
							bind:this={fromInput}
							type="number"
							name="from"
							placeholder="1"
							aria-label="Number"
							min="1"
						/>
					</label>
					<label>
						To chapter
						<input
							value="15"
							bind:this={toInput}
							type="number"
							name="to"
							placeholder="15"
							aria-label="Number"
							min="0"
						/>
					</label>
				</fieldset>

				<input type="submit" value="Download" />
			</form>
		</main>
	</article>
</dialog>

<main class="container">
	<details>
		<summary>Pending</summary>
		<div class="grid">
			{#each $pending as manga, index}
				<article>
					<header>{manga.id} | {manga.progress} chapters downloaded</header>
					<button
						on:click={() => {
							cancelTask(index);
						}}>Cancel</button
					>
				</article>
			{/each}
		</div>
	</details>
	<details>
		<summary>Library</summary>
		<div class="grid">
			{#each Object.keys(library) as manga}
				<article>
					<header>{manga}</header>
					<button
						on:click={() => {
							window.location.href = `/viewer/${manga}`;
						}}>Browse</button
					>
					<button
						on:click={() => {
							deleteManga(manga);
						}}>Delete</button
					>
				</article>
			{/each}
		</div>
	</details>
</main>
