import type { Actions } from "./$types";
import { fail as svelte_fail } from "@sveltejs/kit";
import Manga from "$lib/Manga";
import { ensureDir } from "$lib/utils";
import path from "node:path"

function fail(...args: Parameters<typeof svelte_fail>) {
    console.error("GOT INVALID REQUEST:", ...args)
    return svelte_fail(...args as [status: number, data: { err: string, formData: { link: string, from: string, to: string } }])
}

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const link = data.get("link") as string
        const from = data.get("from") as string
        const to = data.get("to") as string
        const regexp = link.match(/\/catalogue\/([^/]+)\/([^/]+)\//)

        if (link === "") return fail(400, { err: "Please specify a link !", formData: { link, from, to } });
        if (!link.startsWith("https://anime-sama.fr/catalogue/") || !regexp) return fail(400, { err: "Invalid link ! Here is an example: https://anime-sama.fr/catalogue/jujutsu-kaisen/scan/vf/", formData: { link, from, to } })
        const name = regexp![1]
        const type = regexp![2]

        if (from === "") return fail(400, { err: "Please specify from which chapter you want to download !", formData: { link, from, to } });
        if (to === "") return fail(400, { err: "Please specify to which chapter you want to download !", formData: { link, from, to } });

        if (parseInt(from) > parseInt(to)) return fail(400, { err: "From must be greater than to.", formData: { link, from, to } })
        if (parseInt(to) < parseInt(from)) return fail(400, { err: "From must be less than to.", formData: { link, from, to } })

        // //@ts-expect-error can"t type error to anything else that unknown...
        // return fail(400, {err:`"${error.cause}" has already been downloaded. Check the output folder.`, formData: {link, quality, format}})

        console.log("GOT VALID REQUEST:", name, from, to)
        await ensureDir(path.resolve("./downloaded", `${name}${type ? `.${type}` : ""}`))
        new Manga(link, name, type, from, to)
    },
} satisfies Actions;