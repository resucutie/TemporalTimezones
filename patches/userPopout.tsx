import { UserObject } from "ittai";

import * as Temporal from "temporal-polyfill"

import * as webpack from "ittai/webpack";
const { React } = webpack
import * as patcher from "ittai/patcher";
import * as settings from "ittai/settings"

import UserManager from "../handlers/user";
import Timer from "../components/Timer";
import timerStyles from "../components/Timer.scss";

export default function () {
    patcher.after("UserBannerPatch", webpack.find(m => m.default?.displayName === "UserBanner"), "default", ([props]: [{user: UserObject}], res, _this) => {
        if (!settings.get("userpopout", true)) return

        const tz = UserManager.get(props.user.id)?.timeZone

        res.props.children.push(
            <div className={timerStyles["clock-wrapper"]}>
                <Timer
                    tpUpdateFunc={() =>
                        tz ? Temporal.Now.instant().toZonedDateTimeISO(tz) : undefined
                    }
                    userId={props.user.id}
                />
            </div>
        )
    })
}