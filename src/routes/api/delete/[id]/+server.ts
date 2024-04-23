import path from 'path';
import type { RequestHandler } from './$types';
import fs from "fs/promises"

export const GET: RequestHandler = async ({ params }) => {
    const id = params.id
    
    await fs.rm(path.resolve("./downloaded", id), {recursive: true, force: true})

    return new Response("")
};