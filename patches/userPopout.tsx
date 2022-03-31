import { UserObject } from "ittai";

import * as Temporal from "temporal-polyfill"
import { TimeZoneArg } from "temporal-polyfill";

import * as webpack from "ittai/webpack";
const { React } = webpack
import * as patcher from "ittai/patcher";

import UserManager from "../handlers/user";
import { useTemporalUpdate } from "../hooks/useTemporalUpdate";

export default function () {
    patcher.after("UserBannerPatch", webpack.find(m => m.default?.displayName === "UserBanner"), "default", ([props]: [{user: UserObject}], res, _this) => {
        // console.log({props, res, _this});

        const tz = UserManager.get(props.user.id)?.timeZone

        res.props.children.push(<div><HookedTime timezone={tz}/></div>)
    })
}

const HookedTime: React.FC<{ timezone: TimeZoneArg }> = ({ timezone }) => {
    if(!timezone) return null

    const currentTime = useTemporalUpdate(() => Temporal.Now.instant().toZonedDateTimeISO(timezone));

    return currentTime.toPlainTime().toString({ smallestUnit: 'second' })
}