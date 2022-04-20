import * as Temporal from "temporal-polyfill"
import * as React from "react";
import styles from "./Timer.scss"
import { useTemporalUpdate } from "../hooks/useTemporalUpdate";
import * as settings from "ittai/settings"
import TimezoneWrapper from "./TimezoneWrapper";

interface Props {
    tpUpdateFunc?: () => any
}

export default ({tpUpdateFunc = () => Temporal.Now.instant()}: Props) => {
    return <div className={styles["clock"]}>
        <TimezoneWrapper tpFunc={tpUpdateFunc} />
    </div>
}