import z from "zod"
export type Result<T> = {
    success: boolean;
    errors?: Array<T>;
}
export type validationError = {
    path: string,
    message: string
}

export function validateData(data: ApptData): Result<validationError> {
    let result = ApptDataSchema.safeParse(data)
    if (!result.success) {
        let errors: Array<validationError> = []
        result.error.issues.forEach((issue) => {
            errors.push({ path: issue.path[0] as string, message: issue.message })
        })

        return { success: false, errors: errors }
    }
    return { success: true }
}

const dniRegex = /^\d{8}[A-Za-z]$/
const phoneRegex = /^(?:\+34)?[6789]\d{8}$/
const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

const ApptDataSchema = z.object({
    apptDate: z.string().regex(dateTimeRegex, { message: "Appointment date is required" })
        .refine((date) => {
            return (Date.now() < new Date(date).valueOf()) || (date === "")
        }, { message: "Appointment date cannot be in the past" }),
    firstName: z.string().max(20, { message: "First name must be at most 20 characters" })
        .nonempty({ message: "First name is required" }),
    lastName: z.string().max(20, { message: "Last name must be at most 20 characters" })
    .nonempty({ message: "Last name is required" }),
    NID: z.string().regex(dniRegex, { message: "ID must be 8 digits and 1 letter" }),
    phone: z.string().regex(phoneRegex, { message: "Phone must be valid" }),
    birthDate: z.string().regex(dateRegex, { message: "Birth date must be valid" })
        .refine((date) => {
            return (Date.now() > new Date(date).valueOf()) || (date === "")
        }, { message: "Birth date cannot be in the future" }),
    observations: z.string().max(200, { message: "observations must be at most 200 characters" }),
})

export type ApptData = z.infer<typeof ApptDataSchema>
// type ApptData = {
//     apptDate: string;
//     firstName: string;
//     lastName: string;
//     NID: string;
//     phone: string;
//     birthDate: string;
//     observations: string;
// }
