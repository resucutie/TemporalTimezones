/// <reference path="./index.d.ts" />

import { Plugin } from "ittai/entities";
import * as Temporal from "temporal-polyfill"
import * as patcher from "ittai/patcher";

import UserManager from "./handlers/user";
import userPopout from "./patches/userPopout";

export default class IttaiTestPlugin extends Plugin {
    start() {
        // console.log(Temporal.Now.instant().toZonedDateTimeISO(UserManager.get("359175647257690113").timeZone).toPlainTime().toString())
        userPopout()
    }

    stop() {
        patcher.unpatchAll()
    }
}