import { json } from '@sveltejs/kit';
import fs from "fs/promises"
import path from 'path';
import type { RequestHandler } from './$types';
import { ensureDir, type Library } from '$lib/utils';

export const GET: RequestHandler = async ({ params }) => {
    const id = params.id


    await ensureDir(path.resolve("./downloaded"))

    if (!id) {
        const directory = await fs.readdir(path.resolve("./downloaded"))
        const library: Library = {}

        directory.map((e) => { library[e] = [] })

        return json(library)
    } else {
        const directory = await fs.readdir(path.resolve("./downloaded", id))
        const chapters = []
        for (const chapter of directory) {
            chapters.push((await fs.readdir(path.resolve("./downloaded", id, chapter))).map((file: string) => parseInt(file.split(".")[0])).toSorted((a: number, b: number) => a - b))
        }

        return json(chapters)
    }
};