import { UserID } from "ittai";
import * as settings from "ittai/settings";

function add(id: UserID, userParams: SettingsUserObject) {
    //add user to object
    let userList: SettingsUserList = settings.get("users", {})
    userList[id] = userParams
    settings.set("users", userList)
}

function remove(id: UserID) {
    //remove user from object
    let userList: SettingsUserList = settings.get("users", {})
    delete userList[id]
    settings.set("users", userList)
}

function get(id: UserID): SettingsUserObject {
    //get user from object
    let userList: SettingsUserList = settings.get("users", {})
    return userList[id]
}

function getAll(): SettingsUserList {
    return settings.get("users", {})
}

export default {
    add,
    remove,
    get,
    getAll
}