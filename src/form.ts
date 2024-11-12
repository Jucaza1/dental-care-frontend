import { displayErrorMessage } from "./alerts"
import { makeID, setEntryToCookies } from "./cookie"
import { ApptData, validateData, validationError } from "./types"

export class StateForm {
    lastErrors: Array<validationError>
    constructor() {
        this.lastErrors = []
        this.onSubmit = this.onSubmit.bind(this)
    }
    onSubmit(e: Event) {
        e.preventDefault()
        if (!e.target) {
            console.error("cant find formData")
            return
        }
        const rawFormData = new FormData(e.target as HTMLFormElement)
        let formData: ApptData = {
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
                formData[key as keyof ApptData] = val as string;
            }
        })
        const result = validateData(formData)
        if (!result.success) {
            if (!result.errors) { //check for undefined
                console.error("expected errors to be defined")
                return
            }
            displayErrorsForm(result.errors)
            cleanValidFieldErrorForm(result.errors, this.lastErrors)
            this.lastErrors = result.errors
            return
        }
        cleanValidFieldErrorForm([], this.lastErrors)
        //store data in cookies or send
        if (!setEntryToCookies(makeID(formData), formData)){
            return displayErrorMessage()
        }

    }
}

function displayErrorsForm(errors: Array<validationError>) {
    errors.forEach((err) => {
        //check if there is an error already
        const currentErrorSpan = document.getElementById(`errSpan-${err.path}`)
        if (currentErrorSpan) {
            currentErrorSpan.innerText = err.message
            return
        }
        //create errorSpan
        const input = document.getElementsByName(err.path)[0]
        if (!input) {
            console.error(`expected input named ${err.path} to exist`)
            return
        }
        const labelInputGroup = input.parentElement
        if (!labelInputGroup) {
            console.error(`expected label-input parent of input named ${err.path} to exist`)
            return
        }
        const errorSpan = document.createElement("span")
        errorSpan.innerText = err.message
        errorSpan.id = `errSpan-${err.path}`
        labelInputGroup.insertAdjacentElement("afterend", errorSpan)
    })
}

function cleanValidFieldErrorForm(errors: Array<validationError>, lastErrors: Array<validationError>) {
    outer: for (let lastErr of lastErrors) {
        for (let err of errors) {
            if (err.path === lastErr.path) {
                continue outer
            }
        }
        document.getElementById(`errSpan-${lastErr.path}`)?.remove()
    }
}

