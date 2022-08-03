export interface User {
    id: UserID
    services: {
        discord?: string
        [key: string]: string
    }
    createdAt?: number
    username: string
    timezone: import("temporal-polyfill").TimeZoneArg
}

export interface ProtectedUser extends User {
    private: {
        // email: string;
        passwordHash: string
    }
}

export interface LoginUser extends User {
    logintoken?: string
}

export type UserID = string | bigint
