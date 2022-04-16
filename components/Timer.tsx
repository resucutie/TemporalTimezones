import * as Temporal from "temporal-polyfill"
import * as webpack from "ittai/webpack";
const { React } = webpack
import styles from "./Timer.scss"
import { useTemporalUpdate } from "../hooks/useTemporalUpdate";
import * as settings from "ittai/settings"

interface Props {
    tpUpdateFunc?: () => any
}

export default ({tpUpdateFunc = () => Temporal.Now.instant()}: Props) => {
    const currentTime = useTemporalUpdate(tpUpdateFunc);

    return <div className={styles["clock"]}>
        {currentTime.toPlainTime().toString({ smallestUnit: settings.get("seconds", false) ? 'second' : 'minute' })}
    </div>
}