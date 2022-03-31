interface UserObject {
    timeZone: import("temporal-polyfill").TimeZoneArg;
}

type UserList = {
    [key: string]: UserObject;
}