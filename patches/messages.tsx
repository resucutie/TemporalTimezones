import * as webpack from "ittai/webpack";
const {
    React, React: {
        useEffect, useState
    }
} = webpack
import * as patcher from "ittai/patcher";
import { findInReactTree } from "ittai/utilities"
import { useTemporalUpdate } from "../hooks/useTemporalUpdate";
import * as Temporal from "temporal-polyfill"
import UserManager from "../handlers/user";
import { TimeZoneArg } from "temporal-polyfill";
import * as settings from "ittai/settings"
import { UserObject } from "ittai";
import isTimezone from "../utils/isTimezone";
import styles from "./messages.scss"
import { TooltipContainer } from "ittai/components";

export default function() {
    patcher.after("MessagePatch", webpack.find(m => m.default?.displayName === "MessageHeader"), "default", ([props], topRes, _this) => {
        const tz = UserManager.get(props.message.author.id)?.timeZone
        if (!tz) return

        const firstOgFunc = topRes?.type
        if (!firstOgFunc) return
        topRes.type = function (...args: any[]) {
            const firstRes = firstOgFunc.apply(this, args)
            // console.log({ firstRes })

            const timestamp: any = findInReactTree(firstRes, (e: any) => e?.type?.displayName === "MessageTimestamp")
            if (!timestamp) return firstRes
            const ogTimestamp = timestamp?.type
            timestamp.type = function (...args: any[]) {
                const res = ogTimestamp.apply(this, args)
                if (!res?.props?.children) return res

                if (!Array.isArray(res?.props?.children)) res.props.children = [res.props.children]
                
                if (settings.get("timestamp-message", true)) {
                    res.props.children.push(<TooltipContainer className={styles["timestamps"]} text={`Message's timestamp in ${props.message.author.username}'s timezone`}>
                        <>
                            {"("}
                            <TimezoneWrapper
                                tpFunc={() => {
                                    const zdTime = Temporal.ZonedDateTime.from({
                                        timeZone: Temporal.Now.timeZone(),
                                        year: props.message.timestamp.year(),
                                        month: props.message.timestamp.month(),
                                        day: props.message.timestamp.day(),
                                        hour: props.message.timestamp.hour() + 1, //for some reason times are being converted with -1 hour when using the conversion, so i added a 1 to the hour
                                        minute: props.message.timestamp.minute(),
                                        second: props.message.timestamp.second(),
                                        millisecond: props.message.timestamp.millisecond(),
                                    })
                                    return zdTime.withTimeZone(tz)
                                }}
                            />
                            {")"}
                        </>
                    </TooltipContainer>)
                }
                
                return res
            }

            return firstRes
        }
    })
}

const TimezoneWrapper = ({ tpFunc }: { tpFunc: () => any}) => {
    const time = useTemporalUpdate(tpFunc)
    return time.toPlainTime().toString({ smallestUnit: settings.get("seconds", false) ? 'second' : 'minute' })
}