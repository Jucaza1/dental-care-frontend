import { ApptFormEntries } from "./types"

export function storeCookie(id: string, obj: ApptFormEntries): boolean {
    //serialize the object
    const payload = JSON.stringify(obj)
    if (id === "") {
        return false
    }
    document.cookie = `${id}=${payload};path=/;`
    return true
}

export function getCookies(): Map<string, ApptFormEntries> {
    const cookies = document.cookie.split(";")
    let output = new Map<string, ApptFormEntries>()
    for (let cookie of cookies) {
        let [id, val] = cookie.split("=")
        if (!id || !val || id === "" || val === "") {
            continue
        }
        let obj: ApptFormEntries
        try {
            obj = JSON.parse(val)
        } catch (e) {
            console.error("error: unexpected cookie value format")
            continue
        }
        output.set(id, obj as ApptFormEntries)
    }
    return output
}

export function makeID(obj: ApptFormEntries): string {
    return `${obj.NID}-${Date.now()}`
}
