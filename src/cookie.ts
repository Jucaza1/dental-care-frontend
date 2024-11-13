import { ApptData } from "./types"

export function setEntryToCookies(id: string, obj: ApptData): boolean {
    //serialize the object
    const payload = JSON.stringify(obj)
    if (id === "") {
        return false
    }
    document.cookie = `${id}=${payload};path=/;`
    return true
}

export function getEntriesFromCookies(): Map<string, ApptData> {
    const cookies = document.cookie.split(";")
    let output = new Map<string, ApptData>()
    for (let cookie of cookies) {
        let [id, val] = cookie.split("=")
        if (!id || !val || id === "" || val === "") {
            continue
        }
        let obj: ApptData
        try {
            obj = JSON.parse(val)
        } catch (e) {
            console.error("error: unexpected cookie value format ->", val)
            continue
        }
        output.set(id, obj as ApptData)
    }
    return output
}
export function deleteEntryFromCookie(id: string): boolean {
    document.cookie = `${id}=;path=/;max-age=0;`
    return true
}

export function makeID(obj: ApptData): string {
    return `${obj.NID}-${Date.now()}`
}
