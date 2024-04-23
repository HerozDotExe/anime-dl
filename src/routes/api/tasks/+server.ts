import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pendingWritable } from '$lib/server/stores';
import type Manga from '$lib/Manga';

let tasks: Manga[];

pendingWritable.subscribe((v) => {
    tasks = v
})

export const GET: RequestHandler = () => {
    return json(tasks.map((manga) => {
        return {
            id: manga.id, progress: manga.progress
        }
    }))
};