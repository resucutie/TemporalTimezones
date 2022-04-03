/// <reference path="./index.d.ts" />

import { Plugin } from "ittai/entities";
import * as Temporal from "temporal-polyfill"
import * as patcher from "ittai/patcher";
import * as webpack from "ittai/webpack";
const { React } = webpack
import UserManager from "./handlers/user";
import userPopout from "./patchers/userPopout";
import Settings from "./components/Settings";

export default class IttaiTestPlugin extends Plugin {
    start() {
        // @ts-ignore
        if (!window.exportedTemporal) window.exportedTemporal = Temporal;
        
        this.setSettingsPanel(() => <Settings />)

        userPopout()
    }

    stop() {
        patcher.unpatchAll()
    }
}