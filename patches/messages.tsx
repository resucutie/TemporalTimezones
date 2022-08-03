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
import { DiscordIcon, TooltipContainer } from "ittai/components";
import TimezoneWrapper from "../components/TimezoneWrapper";

export default function() {
    const isBothEnabled = () => settings.get("timestamp-message", true) && settings.get("timestamp-current", false)

    patcher.after("MessagePatch", webpack.find(m => m.default?.displayName === "MessageTimestamp"), "default", ([props], res, _this) => {
        if (!(settings.get("timestamp-message", true) || settings.get("timestamp-current", false))) return
        
        const messageID: MessageID = props.id?.replace?.("message-timestamp-", "")
        if (!messageID) return
        const message = Messages.getMessage(CurrentChannels.getChannelId(), messageID)
        if (!message) return
        const user = message.author
        const timezone = UserManager.get(user.id)?.timeZone
        if (!timezone) return

        if (!Array.isArray(res?.props?.children)) res.props.children = [res.props.children]

        res.props.children.push(<div className={styles["timestamps"]}>
            {"("}
            {settings.get("timestamp-message", true) && <TooltipContainer text={`Message's timestamp adjusted to the sender's timezone`}>
                <>
                    {isBothEnabled() && [<DiscordIcon name="ForumChannelIcon" width="10" height="10"/>, " "]}
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
                </>
            </TooltipContainer>}
            {isBothEnabled() && " • "}
            {settings.get("timestamp-current", false) && <TooltipContainer text={`User's current time`}>
                <>
                    {isBothEnabled() && [<DiscordIcon name="HourglassCircle" width="10" height="10" />, " "]}
                    <TimezoneWrapper tpFunc={() => Temporal.Now.instant().toZonedDateTimeISO(timezone)} />
                </>
            </TooltipContainer>}
            {")"}
        </div>)
    })
}

const StaticTimezoneWrapper = ({ tpFunc }: { tpFunc: () => any }) => {
    const [time, setTime] = useState<any>(null)
    useEffect(() => {
        setTime(tpFunc().toPlainTime().toString({ smallestUnit: settings.get("seconds", false) ? 'second' : 'minute' }))
    }, [])
    return time
}