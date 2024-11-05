import { z } from "zod"

let form = document.getElementById("apptForm")
if (form) {
    let lastErrors: Array<validationError> = []
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        if (!e.target) {
            console.error("cant find formData")
            return
        }
        let rawFormData = new FormData(e.target as HTMLFormElement)
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
        let result = validateData(formData)
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
    })
}
// Character counter for Observations field
let observationsInput = document.getElementsByName("observations")[0]
if (observationsInput) {
    observationsInput.addEventListener("change", (e) => {
        let charCount = (e.target as HTMLInputElement).value.length
        let countSpan = document.getElementById("countSpan")
        if (!countSpan) {
            countSpan = document.createElement("span")
            countSpan.id = "countSpan"
            observationsInput.parentElement?.insertAdjacentElement("afterend", countSpan)
        }
        countSpan.innerText = charCount.toString() + "/200"
    })
}

function validateData(data: ApptFormEntries): Result<validationError> {
    let result = ApptFormEntriesSchema.safeParse(data)
    if (!result.success) {
        let errors: Array<validationError> = []
        result.error.issues.forEach((issue) => {
            errors.push({ path: issue.path[0] as string, message: issue.message })
        })

        return { success: false, errors: errors }
    }
    return { success: true }
}

function displayErrors(errors: Array<validationError>) {
    errors.forEach((err) => {
        //check is there is an error already
        let currentErrorSpan = document.getElementById("errSpan-" + err.path)
        if (currentErrorSpan) {
            currentErrorSpan.innerText = err.message
            return
        }
        //create errorSpan
        let input = document.getElementsByName(err.path)[0]
        if (!input) { //check for undefined
            console.error(`expected input named ${err.path} to exist`)
            return
        }
        let labelInputGroup = input.parentElement
        if (!labelInputGroup) { //check for null
            console.error(`expected label-input parent of input named ${err.path} to exist`)
            return
        }
        let errorSpan = document.createElement("span")
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

type Result<T> = {
    success: boolean;
    errors?: Array<T>;
}
type validationError = {
    path: string,
    message: string
}

const dniRegex = /^\d{8}[A-Za-z]$/
const phoneRegex = /^(?:\+34)?[6789]\d{8}$/
const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

const ApptFormEntriesSchema = z.object({
    apptDate: z.string().regex(dateTimeRegex, { message: "Appointment date is required" })
        .refine((date) => {
            return (Date.now() < new Date(date).valueOf()) || (date === "")
        }, { message: "Appointment date cannot be in the past" }),
    firstName: z.string().max(20, { message: "First name must be at most 20 characters" })
        .nonempty({ message: "First name is required" }),
    lastName: z.string().max(20, { message: "Last name must be at most 20 characters" })
    .nonempty({ message: "Last name is required" }),
    NID: z.string().regex(dniRegex, { message: "ID must be 8 digits and a letter" }),
    phone: z.string().regex(phoneRegex, { message: "Phone must be valid" }),
    birthDate: z.string().regex(dateRegex, { message: "Birth date must be valid" })
        .refine((date) => {
            return (Date.now() > new Date(date).valueOf()) || (date === "")
        }, { message: "Birth date cannot be in the future" }),
    observations: z.string().max(200, { message: "observations must be at most 200 characters" }),
})

type ApptFormEntries = z.infer<typeof ApptFormEntriesSchema>
// type ApptFormEntries = {
//     apptDate: string;
//     firstName: string;
//     lastName: string;
//     NID: string;
//     phone: string;
//     birthDate: string;
//     observations: string;
// }
