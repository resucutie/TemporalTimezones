import timezoneListName from "./timezoneListName.json";

export default (timezoneArray: string[] = timezoneListName) => {
    //separate timezones in categories. example: America/New_York would make an America category with New_York as a subcategory
    return timezoneArray.reduce((acc: { [key: string]: string[] }, timezone: string) => {
        const [category] = timezone.split("/")
        if (!acc[category]) {
            acc[category] = [timezone]
        } else {
            acc[category].push(timezone)
        }
        return acc
    }, {})
}