import { displaySuccessMessage } from "./alerts"
import { deleteEntryFromCookie, getEntriesFromCookies, setEntryToCookies } from "./cookie"
import { ApptData, validateData, validationError } from "./types"

enum fields {
    NID = "NID",
    apptDate = "apptDate",
    firstName = "firstName",
    lastName = "lastName",
    phone = "phone",
    birthDate = "birthDate",
    observations = "observations",
}

export function intoTableRow(id: string, appt: ApptData): HTMLTableRowElement {
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
        b1.className = "menu-button"
        b1.onclick = onclickDelete
        const b2 = document.createElement("button")
        b2.innerText = "Edit"
        b2.id = `${id}-button2`
        b2.className = "menu-button"
        b2.onclick = onclickEditRow
        td.append(b1, b2)

    }
    row.append(td)
    row.id = id
    return row
}

function onclickEditRow(e: Event) {
    const button = e.target as HTMLButtonElement
    const row = button.parentElement?.parentElement as HTMLTableRowElement
    if (!row) {
        console.error("expected row element to exist")
    }
    if (!transformRowEdit(row)) {
        console.error("could not convert row into editable")
    }
}

function transformRowEdit(row: HTMLTableRowElement): boolean {
    const mapEntries = getEntriesFromCookies()
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
    success &&= replaceCellEdit(id, entry.observations, "textarea", fields.observations)
    success &&= replaceButtonsEdit(id)
    return success
}

function replaceCellEdit(id: string, entryField: string, type: string, field: string): boolean {
    const td = document.getElementById(`${id}-${field}`)
    if (!td) {
        console.error("expected cell element to be present")
        return false
    }
    const fieldGroup = document.createElement("div")
    fieldGroup.className = "field-group"
    if (type === "textarea") {
        const textarea = document.createElement("textarea")
        textarea.value = entryField
        textarea.id = `${id}-${field}-input`
        td.innerText = ""
        fieldGroup.append(textarea)
        td.append(fieldGroup)

        return true
    }
    const input = document.createElement("input")
    input.type = type
    input.value = entryField
    input.id = `${id}-${field}-input`
    td.innerText = ""
    fieldGroup.append(input)
    td.append(fieldGroup)

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
    b1.onclick = onclickCancel
    b2.innerText = "Save"
    const stateEditableRow = new StateEditableRow(id)
    b2.onclick = stateEditableRow.onclickSave
    return true
}

function onclickCancel(e: Event) {
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
    const mapEntries = getEntriesFromCookies()
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
    b1.onclick = onclickDelete
    b2.innerText = "Edit"
    b2.onclick = onclickEditRow
    return true
}

class StateEditableRow {
    lastErrors: Array<validationError>
    id: string
    constructor(id: string) {
        this.lastErrors = []
        this.onclickSave = this.onclickSave.bind(this)
        this.id = id
    }
    onclickSave(e: Event) {
        const button = e.target as HTMLButtonElement
        if (!button) {
            console.error("expected button save to exist")
        }
        const row = button.parentElement?.parentElement as HTMLTableRowElement
        const id = row.id
        if (!id) {
            console.error("expected id to be present in tr element")
            return
        }
        const rawEditData: ApptData = {
            NID: getInputValue(id, fields.NID),
            apptDate: getInputValue(id, fields.apptDate),
            phone: getInputValue(id, fields.phone),
            firstName: getInputValue(id, fields.firstName),
            lastName: getInputValue(id, fields.lastName),
            birthDate: getInputValue(id, fields.birthDate),
            observations: getInputValue(id, fields.observations),
        }

        const result = validateData(rawEditData)
        if (!result.success) {
            if (!result.errors) { //check for undefined
                console.error("expected errors to be defined")
                return
            }
            displayErrorsRow(id, result.errors)
            cleanValidFieldErrorRow(id, result.errors, this.lastErrors)
            this.lastErrors = result.errors
            return
        }

        cleanValidFieldErrorRow(id, [], this.lastErrors)
        //store data in cookies or send
        if (setEntryToCookies(this.id, rawEditData)) {
            displaySuccessMessage()
        }
        if (!transformRowNormal(row)) {
            console.error("couldnt convert row into editable")
        }

    }
}

function getInputValue(id: string, field: fields) {
    return (document.getElementById(`${id}-${field}-input`) as HTMLInputElement)?.value ?? ""
}

function displayErrorsRow(id: string, errors: validationError[]) {
    errors.forEach((err) => {
        //check is there is an error already
        const currentErrorSpan = document.getElementById(`${id}-errSpan-${err.path}`)
        if (currentErrorSpan) {
            currentErrorSpan.innerText = err.message
            return
        }
        //create errorSpan
        const input = document.getElementById(`${id}-${err.path}-input`)
        if (!input) { //check for undefined
            console.error(`expected input with id ${id}-${err.path}-input to exist`)
            return
        }
        const errorSpan = document.createElement("span")
        errorSpan.innerText = err.message
        errorSpan.id = `${id}-errSpan-${err.path}`
        input.insertAdjacentElement("afterend", errorSpan)
    })
}

function cleanValidFieldErrorRow(id: string, errors: validationError[], lastErrors: validationError[]) {
    outer: for (let lastErr of lastErrors) {
        for (let err of errors) {
            if (err.path === lastErr.path) {
                continue outer
            }
        }
        document.getElementById(`${id}-errSpan-${lastErr.path}`)?.remove()
    }
}

function onclickDelete(e: Event) {
    const button = e.target as HTMLButtonElement
    if (!button) {
        console.error("expected button save to exist")
    }
    const row = button.parentElement?.parentElement as HTMLTableRowElement
    const id = row.id
    if (!id) {
        console.error("expected id to be present in tr element")
        return
    }
    if (!window.confirm("Are you sure you want to delete the appointment?")) {
        return
    }
    deleteEntryFromCookie(id)
    row.remove()
}

