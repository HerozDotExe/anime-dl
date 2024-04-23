import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, fetch }): Promise<{id:string, chapters: number[][]}> => {
    const id = params.id

    return { id, chapters: await (await fetch(`/api/library/${id}`)).json() }
};
