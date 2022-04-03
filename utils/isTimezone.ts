import * as Temporal from "temporal-polyfill"
import { TimeZoneArg } from "temporal-polyfill"

export default (timezone: TimeZoneArg) => {
    try{
        Temporal.TimeZone.from(timezone)
        return true
    } catch (e) {
        return false
    }
}