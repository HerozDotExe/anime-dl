import { writable, type Writable } from "svelte/store";

export const pending: Writable<{id:string, progress:string}[]> = writable([])