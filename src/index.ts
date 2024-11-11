import { getCookies, makeID, storeCookie } from "./cookie"
import { ApptFormEntries, validateData, validationError } from "./types"

const form = document.getElementById("apptForm")
if (form) {
    let lastErrors: Array<validationError> = []
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        if (!e.target) {
            console.error("cant find formData")
            return
        }
        const rawFormData = new FormData(e.target as HTMLFormElement)
        let formData: ApptFormEntries = {
            apptDate: "",
            firstName: "",
            lastName: "",
            NID: "",
            phone: "",
            birthDate: "",
            observations: "",
        }
        rawFormData.forEach((val, key) => {
            if (key in formData) {
                formData[key as keyof ApptFormEntries] = val as string;
            }
        })
        console.table(formData)
        const result = validateData(formData)
        if (!result.success) {
            if (!result.errors) { //check for undefined
                console.error("expected errors to be defined")
                return
            }
            displayErrors(result.errors)
            cleanValidFieldError(result.errors, lastErrors)
            lastErrors = result.errors
            return
        }
        cleanValidFieldError([], lastErrors)
        //store data in cookies or send
        storeCookie(makeID(formData), formData)
    })
}
// Character counter for Observations field
const observationsInput = document.getElementsByName("observations")[0]
if (observationsInput) {
    observationsInput.addEventListener("change", (e) => {
        const charCount = (e.target as HTMLInputElement).value.length
        let countSpan = document.getElementById("countSpan")
        if (!countSpan) {
            countSpan = document.createElement("span")
            countSpan.id = "countSpan"
            observationsInput.parentElement?.insertAdjacentElement("afterend", countSpan)
        }
        countSpan.innerText = charCount.toString() + "/200"
    })
}

function displayErrors(errors: Array<validationError>) {
    errors.forEach((err) => {
        //check is there is an error already
        const currentErrorSpan = document.getElementById("errSpan-" + err.path)
        if (currentErrorSpan) {
            currentErrorSpan.innerText = err.message
            return
        }
        //create errorSpan
        const input = document.getElementsByName(err.path)[0]
        if (!input) { //check for undefined
            console.error(`expected input named ${err.path} to exist`)
            return
        }
        const labelInputGroup = input.parentElement
        //check for null
        if (!labelInputGroup) {
            console.error(`expected label-input parent of input named ${err.path} to exist`)
            return
        }
        const errorSpan = document.createElement("span")
        errorSpan.innerText = err.message
        errorSpan.id = "errSpan-" + err.path
        labelInputGroup.insertAdjacentElement("afterend", errorSpan)
    })
}

function cleanValidFieldError(errors: Array<validationError>, lastErrors: Array<validationError>) {
    outer: for (let lastErr of lastErrors) {
        for (let err of errors) {
            if (err.path === lastErr.path) {
                continue outer
            }
        }
        document.getElementById("errSpan-" + lastErr.path)?.remove()
    }
}

const table = document.getElementsByClassName("appt-table")[0] as HTMLTableElement
if (table) {
    console.log("table exists, setting evenet")
    document.addEventListener("DOMContentLoaded", (_e) => {
        const tbody = document.getElementsByClassName("appt-table-body")[0]
        if (!tbody) {
            console.error("expected table body to exist")
            return
        }
        console.log("getting appts from cookies")
        const mapEntries = getCookies()
        mapEntries.forEach((appt, id) => {
            console.log(id)
            console.table(appt)
            tbody.append(intoTableRow(id, appt))
        })
    })
}
enum fields {
    NID = "NID",
    apptDate = "apptDate",
    firstName = "firstName",
    lastName = "lastName",
    phone = "phone",
    birthDate = "birthDate",
    observations = "observations",
}

function intoTableRow(id: string, appt: ApptFormEntries): HTMLTableRowElement {
    const row = document.createElement("tr") as HTMLTableRowElement
    let td = document.createElement("td")
    td.innerText = appt.NID
    td.id = `${id}-${fields.NID}`
    row.append(td)
    td = document.createElement("td")
    td.innerText = appt.firstName
    td.id = `${id}-${fields.firstName}`
    row.append(td)
    td = document.createElement("td")
    td.innerText = appt.lastName
    td.id = `${id}-${fields.lastName}`
    row.append(td)
    td = document.createElement("td")
    td.innerText = appt.birthDate
    td.id = `${id}-${fields.birthDate}`
    row.append(td)
    td = document.createElement("td")
    td.innerText = appt.apptDate
    td.id = `${id}-${fields.apptDate}`
    row.append(td)
    td = document.createElement("td")
    td.innerText = appt.phone
    td.id = `${id}-${fields.phone}`
    row.append(td)
    td = document.createElement("td")
    td.innerText = appt.observations
    td.id = `${id}-${fields.observations}`
    row.append(td)
    td = document.createElement("td")
    {
        const b1 = document.createElement("button")
        b1.innerText = "Delete"
        b1.id = `${id}-button1`
        b1.onclick = () => { window.alert("todo") }
        const b2 = document.createElement("button")
        b2.innerText = "Edit"
        b2.id = `${id}-button2`
        b2.onclick = OnclickEditRow
        td.append(b1, b2)

    }
    row.append(td)
    row.id = id
    return row
}

function OnclickEditRow(e: Event) {
    const button = e.target as HTMLButtonElement
    const row = button.parentElement?.parentElement as HTMLTableRowElement
    if (!row) {
        console.error("expected row element to exist")
    }
    if (!transformRowEdit(row)) {
        console.error("couldnt convert row into editable")
    }
}
function transformRowEdit(row: HTMLTableRowElement): boolean {
    const mapEntries = getCookies()
    const id = row.id
    const entry = mapEntries.get(id)
    if (!entry) {
        console.error("expected id to be present in row")
        //do nothing
        return false
    }
    let success = replaceCellEdit(id, entry.NID, "text", fields.NID)
    success &&= replaceCellEdit(id, entry.firstName, "text", fields.firstName)
    success &&= replaceCellEdit(id, entry.lastName, "text", fields.lastName)
    success &&= replaceCellEdit(id, entry.birthDate, "date", fields.birthDate)
    success &&= replaceCellEdit(id, entry.apptDate, "datetime-local", fields.apptDate)
    success &&= replaceCellEdit(id, entry.phone, "text", fields.phone)
    success &&= replaceCellEdit(id, entry.observations, "text", fields.observations)
    success &&= replaceButtonsEdit(id)
    return success
}
function replaceCellEdit(id: string, entryField: string, type: string, field: string): boolean {
    const td = document.getElementById(`${id}-${field}`)
    if (!td) {
        console.error("expected cell element to be present")
        return false
    }
    const wrapInput = document.createElement("div")
    wrapInput.className = "table-input-gp"
    const input = document.createElement("input")
    input.type = type
    input.value = entryField
    input.id = `${id}-${field}-input`
    td.innerText = ""
    wrapInput.append(input)
    td.append(wrapInput)

    return true
}
function replaceButtonsEdit(id: string): boolean {
    const b1 = document.getElementById(`${id}-button1`) as HTMLButtonElement
    if (!b1) {
        return false
    }
    const b2 = document.getElementById(`${id}-button2`) as HTMLButtonElement
    if (!b2) {
        return false
    }
    b1.innerText = "Cancel"
    b1.onclick = OnclickCancel
    b2.innerText = "Save"
    b2.onclick = () => { window.alert("todo") }
    return true
}
function OnclickCancel(e: Event) {
    const button = e.target as HTMLButtonElement
    if (!button) {
        console.error("expected button cancel to exist")
    }
    const row = button.parentElement?.parentElement as HTMLTableRowElement
    const id = row.id
    if (!id) {
        console.error("expected id to be present in tr element")
        return
    }
    if (!transformRowNormal(row)) {
        console.error("couldnt convert row into editable")
    }
}
function transformRowNormal(row: HTMLTableRowElement): boolean {
    const mapEntries = getCookies()
    const id = row.id
    const entry = mapEntries.get(id)
    if (!entry) {
        console.error("expected id to be present in row")
        //do nothing
        return false
    }
    const normalRow = intoTableRow(id, entry)
    row.replaceWith(normalRow)
    let success = replaceButtonsNormal(id)
    return success

}
function replaceButtonsNormal(id: string): boolean {
    const b1 = document.getElementById(`${id}-button1`)
    if (!b1) {
        return false
    }
    const b2 = document.getElementById(`${id}-button2`)
    if (!b2) {
        return false
    }
    b1.innerText = "Delete"
    b2.innerText = "Edit"
    return true
}
