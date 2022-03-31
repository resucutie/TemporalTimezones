import { UserID } from "ittai";
import * as settings from "ittai/settings";

function add(id: UserID, userParams: UserObject) {
    //add user to object
    let userList: UserList = settings.get("users", {})
    userList[id] = userParams
    settings.set("users", userList)
}

function remove(id: UserID) {
    //remove user from object
    let userList: UserList = settings.get("users", {})
    delete userList[id]
    settings.set("users", userList)
}

function get(id: UserID): UserObject {
    //get user from object
    let userList: UserList = settings.get("users", {})
    return userList[id]
}

export default {
    add,
    remove,
    get
}