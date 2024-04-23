import type { RequestHandler } from './$types';
import { pendingWritable } from '$lib/server/stores';

export const GET: RequestHandler = ({ params }) => {
    const id = parseInt(params.id)

    pendingWritable.update((tasks) => {
        tasks[id].cancelled = true
        return [ ...(tasks.splice(id+1, 1)) ]
    })

    return new Response("")
};