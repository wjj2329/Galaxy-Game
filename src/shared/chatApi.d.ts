import { SocketAPI, StandardSocketAPI } from "./socketApi";

export interface User {
    username: string
}

export interface Message {
    username: string
    message: string
}

export type ChatApi = StandardSocketAPI & {
    newUser: { req: User, res: boolean }
    newMessage: { req: Message }
    getUsers: { req: void, res: User[] }
    userDisconnected: { req: User }
}
