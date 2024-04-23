import { writable, type Writable } from "svelte/store";
import type Manga from "$lib/Manga";

export const pendingWritable: Writable<Manga[]> = writable([])