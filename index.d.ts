declare module "*.scss"; declare module "*.sass"; declare module "*.less"; declare module "*.styl";

interface SettingsUserObject {
    timeZone: import("temporal-polyfill").TimeZoneArg;
}

type SettingsUserList = {
    [key: string]: SettingsUserObject;
}