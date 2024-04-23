import { pendingWritable } from "./server/stores";
import fs from "node:fs"
import path from "node:path"
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { ensureDir, exists, UnknownError, EndReachedError, RegExpError } from "$lib/utils";

async function download(from: string, to: string) {
    const stream = fs.createWriteStream(to)
    const response = await fetch(from)

    if (!response.ok || (await response.clone().text()).startsWith("<!")) {
        if (response.status === 404) {
            throw new EndReachedError()
        } else {
            throw new UnknownError(`${response.status}: ${response.statusText}`)
        }
    }

    //@ts-expect-error wtf
    await finished(Readable.fromWeb(response.body!).pipe(stream))
}

async function getParsedName(link: string) {
    const pageContent = await (await fetch(link)).text()
    const regexp = pageContent.match(/<title>(.*?)<\/title>/)
    if (!regexp) {
        throw new RegExpError()
    }
    return regexp[1].split(" -")[0]
}

export default class Manga {
    id: string
    link: string
    name: string
    type: string
    from: string
    to: string
    progress: string
    cancelled: boolean
    constructor(link: string, name: string, type: string, from: string, to: string) {
        this.id = `${name}${type ? `.${type}` : ""}`
        this.link = link
        this.name = name
        this.type = type
        this.from = from
        this.to = to
        this.progress = `0/${parseInt(this.to) - parseInt(this.from) + 1}`
        this.cancelled = false

        this.start()
    }

    async start() {
        // const parsedName = name.split("-").map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join("%20")
        const parsedName = await getParsedName(this.link)

        if (!this.cancelled) { pendingWritable.update((t) => [...t, this]) }

        for (let chapter = parseInt(this.from); chapter < parseInt(this.to) + 1; chapter++) {
            if (this.cancelled) break

            await ensureDir(path.resolve("./downloaded", this.id, chapter.toString()))
            const chapterLink = "https://anime-sama.fr/s1/scans/" + parsedName + "/" + chapter + "/"

            let part = 1
            let nextPartExists = true
            while (nextPartExists) {
                if (this.cancelled) break

                const destination = path.resolve("./downloaded", this.id, chapter.toString(), `${part}.jpg`)
                const image = chapterLink + `${part}.jpg`
                try {
                    if (!await exists(destination)) await download(image, destination)
                    part++
                    console.log("Downloaded", image)
                } catch (error) {
                    if (error instanceof EndReachedError) {
                        nextPartExists = false
                    } else {
                        //! SET PENDING TO ERRORED
                    }
                }
            }

            this.progress = `${chapter}/${parseInt(this.to) - parseInt(this.from) + 1}`

            if (!this.cancelled) {
                pendingWritable.update((t) => {
                    t = [...t.filter((v) => v.id !== this.id)]
                    return [...t, this]
                })
            }
        }

        if (!this.cancelled) {
            console.log("Finished downloading", this.id, this.from, this.to)
            pendingWritable.update((t) => {
                return [...t.filter((v) => v.id !== this.id)]
            })
        } else console.log("Cancelled", this.id, this.from, this.to)

        // ! "https://anime-sama.fr/catalogue/jujutsu-kaisen/scan/vf/"
        // ! "https://anime-sama.fr/s1/scans/" + nomOeuvre + "/" + chapitres + "/" + i + ".jpg" = PATTERN DES IMAGES
    }
}


// export async function Manga2(link: string, name: string, type: string, from: string, to: string) {
//     // const parsedName = name.split("-").map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join("%20")
//     const parsedName = await getParsedName(link)

//     pending.update((t) => [...t, { name: `${name}${type ? `.${type}` : ""}`, progress: `0/${parseInt(to) - parseInt(from) + 1}` }])

//     for (let chapter = parseInt(from); chapter < parseInt(to) + 1; chapter++) {
//         await ensureDir(path.resolve("./downloaded", `${name}${type ? `.${type}` : ""}`, chapter.toString()))
//         const chapterLink = "https://anime-sama.fr/s1/scans/" + parsedName + "/" + chapter + "/"

//         let part = 1
//         let nextPartExists = true
//         while (nextPartExists) {
//             const destination = path.resolve("./downloaded", `${name}${type ? `.${type}` : ""}`, chapter.toString(), `${part}.jpg`)
//             const image = chapterLink + `${part}.jpg`
//             try {
//                 if (!await exists(destination)) await download(image, destination)
//                 part++
//                 console.log("Downloaded", image)
//             } catch (error) {
//                 if (error instanceof EndReachedError) {
//                     nextPartExists = false
//                 } else {
//                     //! SET PENDING TO ERRORED
//                 }
//             }
//         }

//         pending.update((t) => {
//             t = [...t.filter((v) => v.name !== `${name}${type ? `.${type}` : ""}`)]
//             return [...t, { name: `${name}${type ? `.${type}` : ""}`, progress: `${chapter}/${parseInt(to) - parseInt(from) + 1}` }]
//         })
//     }

//     console.log("Finished downloading", name, from, to)

//     // ! "https://anime-sama.fr/catalogue/jujutsu-kaisen/scan/vf/"
//     // ! "https://anime-sama.fr/s1/scans/" + nomOeuvre + "/" + chapitres + "/" + i + ".jpg" = PATTERN DES IMAGES



//     // const browser = await puppeteer.launch();
//     // const page = await browser.newPage();

//     // // Navigate the page to a URL
//     // await page.goto(link);

//     // // Set screen size
//     // await page.setViewport({ width: 1080, height: 1024 });

//     // // Type into search box
//     // // await page.type(".devsite-search-field", "automate beyond recorder");

//     // // Wait and click on first result
//     // // const searchResultSelector = ".devsite-result-item-link";
//     // // await page.waitForSelector(searchResultSelector);
//     // // await page.click(searchResultSelector);

//     // // Locate the full title with a unique string
//     // // const textSelector = await page.waitForSelector(
//     //     // "text/Customize and automate"
//     // // );
//     // // const fullTitle = await textSelector?.evaluate(el => el.textContent);

//     // // Print the full title
//     // // console.log("The title of this blog post is "%s".", fullTitle);

//     // await browser.close();
// }