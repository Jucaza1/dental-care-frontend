import { getEntriesFromCookies } from "./cookie"
import { StateForm } from "./form"
import { intoTableRow } from "./table"

//Form page
const form = document.getElementById("apptForm")
if (form) {
    const stateForm = new StateForm()
    form.addEventListener("submit", stateForm.onSubmit)
    //character counter for Observations field
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
}

//Table page
const table = document.getElementsByClassName("appt-table")[0] as HTMLTableElement
if (table) {
    document.addEventListener("DOMContentLoaded", (_e) => {
        const tbody = document.getElementsByClassName("appt-table-body")[0]
        if (!tbody) {
            console.error("expected table body to exist")
            return
        }
        const mapEntries = getEntriesFromCookies()
        mapEntries.forEach((appt, id) => {
            tbody.append(intoTableRow(id, appt))
        })
    })
}


