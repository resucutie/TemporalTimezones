import * as webpack from "ittai/webpack";
const { React, React: { useReducer, useEffect, useState } } = webpack	
import * as patcher from "ittai/patcher";
import { Messages, CurrentChannels } from "ittai/stores"
import { useTemporalUpdate } from "../hooks/useTemporalUpdate";
import * as Temporal from "temporal-polyfill"
import UserManager from "../handlers/user";
import { TimeZoneArg } from "temporal-polyfill";
import * as settings from "ittai/settings"
import { MessageID, UserObject } from "ittai";
import isTimezone from "../utils/isTimezone";
import styles from "./messages.scss"
import { TooltipContainer } from "ittai/components";

export default function() {
    patcher.after("MessagePatch", webpack.find(m => m.default?.displayName === "MessageTimestamp"), "default", ([props], res, _this) => {
        const messageID: MessageID = props.id?.replace?.("message-timestamp-", "")
        if (!messageID) return
        const message = Messages.getMessage(CurrentChannels.getChannelId(), messageID)
        if (!message) return
        const user = message.author
        const timezone = UserManager.get(user.id)?.timeZone
        if (!timezone) return

        if (!Array.isArray(res?.props?.children)) res.props.children = [res.props.children]

        res.props.children.push(<TooltipContainer className={styles["timestamps"]} text={`Message's timestamp adjusted to the sender's timezone`}>
            <>
                {"("}
                <StaticTimezoneWrapper
                    tpFunc={() => {
                        const zdTime = Temporal.ZonedDateTime.from({
                            timeZone: Temporal.Now.timeZone(),
                            year: props.timestamp.year(),
                            month: props.timestamp.month(),
                            day: props.timestamp.day(),
                            hour: props.timestamp.hour(),
                            minute: props.timestamp.minute(),
                            second: props.timestamp.second(),
                            millisecond: props.timestamp.millisecond(),
                        }).withTimeZone(timezone)

                        //creating another ZonedDateTime to see the DST time. its very wacky, not proud
                        const zdIsDST = Temporal.ZonedDateTime.from({
                            timeZone: Temporal.Now.timeZone(),
                            year: props.timestamp.year(),
                            month: props.timestamp.month(),
                            day: props.timestamp.day(),
                            hour: props.timestamp.hour() + 1,
                        }).withTimeZone(timezone).hour === zdTime.hour
                        return zdIsDST ? zdTime.add({ hours: 1 }) : zdTime
                    }}
                />
                {")"}
            </>
        </TooltipContainer>)
    })
}

const StaticTimezoneWrapper = ({ tpFunc }: { tpFunc: () => any }) => {
    const [time, setTime] = useState<any>(null)
    useEffect(() => {
        setTime(tpFunc().toPlainTime().toString({ smallestUnit: settings.get("seconds", false) ? 'second' : 'minute' }))
    }, [])
    return time
}