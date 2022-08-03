import { useTemporalUpdate } from "../hooks/useTemporalUpdate"
import * as settings from "ittai/settings"

export default ({ tpFunc }: { tpFunc: () => any }) => {
    const time = useTemporalUpdate(tpFunc)
    // console.log(time)
    return time.toPlainTime().toString({
        smallestUnit: settings.get("seconds", false) ? "second" : "minute",
    });
}