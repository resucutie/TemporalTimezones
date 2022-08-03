/// <reference path="./index.d.ts" />

import { Plugin } from "ittai/entities";
import * as Temporal from "temporal-polyfill"
import * as patcher from "ittai/patcher";
import * as webpack from "ittai/webpack";
import * as toast from "ittai/toast"
const { React } = webpack
import userPopout from "./patches/userPopout";
import Settings from "./components/Settings";
import contextMenu from "./patches/contextMenu";
import messages from "./patches/messages";

export default class TemporalTimezones extends Plugin {
    start() {
        // @ts-ignore
        if (!window.exportedTemporal) window.exportedTemporal = Temporal

        this.setSettingsPanel(() => <Settings />)

        userPopout()
        // contextMenu() //removed due to issues with the context menu patching. i need to learn how to patch it properly... or somebody else to do it.
        messages()
    }

    stop() {
        patcher.unpatchAll()
    }
}