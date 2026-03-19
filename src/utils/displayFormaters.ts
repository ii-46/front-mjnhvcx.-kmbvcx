import moment from "moment";


export function displayTimestamp(input: string): string{
    return moment(input).format("DD/MM/YYYY h:mm:ss")
}
export function displayDate(input: string): string{
    return moment(input).format("DD/MM/YYYY")
}
