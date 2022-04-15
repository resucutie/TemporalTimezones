/// <reference path="./index.d.ts" />

import { Plugin } from "ittai/entities";
import * as Temporal from "temporal-polyfill"
import * as patcher from "ittai/patcher";
import * as webpack from "ittai/webpack";
const { React } = webpack
import UserManager from "./handlers/user";
import userPopout from "./patchers/userPopout";
import Settings from "./components/Settings";
import contextMenu from "./patchers/contextMenu";

export default class TemporalTimezones extends Plugin {
    start() {
        // @ts-ignore
        if (!window.exportedTemporal) window.exportedTemporal = Temporal;
        
        this.setSettingsPanel(() => <Settings />)

        userPopout()
        contextMenu()
    }

    stop() {
        patcher.unpatchAll()
    }
}