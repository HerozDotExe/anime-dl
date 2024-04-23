import type { RequestHandler } from './$types';
import path from 'path';
import fs from "fs/promises"
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
    const id = params.id
    const chapter = params.chapter
    const image = params.image

    try {
        const data = await fs.readFile(path.resolve(`./downloaded/${id}/${chapter}/${image}.jpg`));

        setHeaders({
            'Content-Type': "image/jpeg"
        },)
        return new Response(data)
    } catch (e) {
        return error(500)
    }
};