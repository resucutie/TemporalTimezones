import { UserObject } from "ittai";

import * as Temporal from "temporal-polyfill"

import * as webpack from "ittai/webpack";
const { React } = webpack
import * as patcher from "ittai/patcher";

import UserManager from "../handlers/user";
import Timer from "../components/Timer";

export default function () {
    patcher.after("UserBannerPatch", webpack.find(m => m.default?.displayName === "UserBanner"), "default", ([props]: [{user: UserObject}], res, _this) => {
        // console.log({props, res, _this});

        const tz = UserManager.get(props.user.id)?.timeZone

        if (!tz) return

        res.props.children.push(<Timer tpUpdateFunc={() => Temporal.Now.instant().toZonedDateTimeISO(tz)} />)
    })
}