import fs from "node:fs/promises"

export async function exists(path: string) {
    try {
        await fs.stat(path)
        return true
    } catch (error) {
        return false
    }
}

export async function ensureDir(path: string) {

    if (!await exists(path)) {
        await fs.mkdir(path, { recursive: true })
    }
}

export interface Library {
    [key: string]: number[]
}

export class EndReachedError extends Error { }
export class UnknownError extends Error { 
    constructor(info: string){
        super(info)
    }
}
export class RegExpError extends Error {}