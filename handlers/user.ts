import { UserID } from "ittai";
import * as settings from "ittai/settings";

// Essentials
export const getAll = (): SettingsUserList => settings.get("users", {});
export const override = (userList: SettingsUserList = {}) =>
    settings.set("users", userList);

// Basics
export function get(id: UserID): SettingsUserObject {
    let userList: SettingsUserList = getAll()
    return userList[id]
}

export const save = (userList: SettingsUserList = {}) => override(Object.assign({}, getAll(), userList))

// Helpers
export function add(
    id: UserID,
    userParams: SettingsUserObject,
    strictlyNew: boolean = false
) {
    if (strictlyNew && exists(id))
        throw new Error(
            "User already exists. Please use edit() instead. If you're not a developer, please report this to A user#8169 or another contributor."
        );

    let userList: SettingsUserList = getAll();

    userList[id] = userParams;

    save(userList);
}

export function edit(
    id: UserID,
    userParams: SettingsUserObject,
    strictlyExisting: boolean = true
) {
    if (!strictlyExisting && exists(id))
        throw new Error(
            "User does not exist. Please use add() instead. If you're not a developer, please report this to A user#8169 or another contributor."
        );

    let userList: SettingsUserList = getAll();

    userList[id] = userParams;

    save(userList);
}

export function remove(id: UserID) {
    if (!exists(id))
        throw new Error(
            "User does not exist. If you're not a developer, please report this to A user#8169 or another contributor."
        );
    let userList: SettingsUserList = getAll();
    delete userList[id];
    override(userList);
}

export const exists = (id: UserID) => Boolean(get(id));

export default {
    get,
    getAll,
    save,
    override,
    add,
    edit,
    remove,
    exists
}