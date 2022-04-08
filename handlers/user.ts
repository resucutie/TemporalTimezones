import { UserID } from "ittai";
import * as settings from "ittai/settings";

// Essentials
const getAll = (): SettingsUserList => settings.get("users", {})
const override = (userList: SettingsUserList = {}) => settings.set("users", userList)

// Basics
function get(id: UserID): SettingsUserObject {
    let userList: SettingsUserList = getAll()
    return userList[id]
}

const save = (userList: SettingsUserList = {}) => override(Object.assign({}, getAll(), userList))

// Helpers
function add(id: UserID, userParams: SettingsUserObject, strictlyNew: boolean = false) {
    let userList: SettingsUserList = getAll()
    
    if (strictlyNew && Boolean(userList[id])) throw new Error("User already exists. Please use edit() instead. If you're not a developer, please report this to A user#8169 or another contributor.")
    
    userList[id] = userParams
    
    save(userList)
}

function edit(id: UserID, userParams: SettingsUserObject, strictlyExisting: boolean = true) {
    let userList: SettingsUserList = getAll()

    if (!strictlyExisting && Boolean(userList[id])) throw new Error("User does not exist. Please use add() instead. If you're not a developer, please report this to A user#8169 or another contributor.")

    userList[id] = userParams

    save(userList)
}

function remove(id: UserID) {
    let userList: SettingsUserList = getAll()
    delete userList[id]
    override(userList)
}

export default {
    get,
    getAll,
    save,
    override,
    add,
    edit,
    remove
}