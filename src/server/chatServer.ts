
// Example chat server

import { Server } from "http";
import { TypedSocket, SocketAPI } from "shared/socketApi";
import { ChatApi, User, Message } from "shared/chatApi";
import * as socketIo from "socket.io";

export default class ChatServer {
    private users: Set<User>;
    private io: SocketIO.Server;

    constructor(private server: Server) {
        this.io = socketIo(server);
        this.users = new Set();
        this.io.on("connection", (sock) => this.onConnect(sock));
    }

    private onConnect(sock: TypedSocket<ChatApi>) {
        let socketUser: User = undefined;
        sock.on("newUser", (user, succeeded) => {
            if (this.users.has(user)) {
                succeeded(false);
                return;
            }
            socketUser = user;
            sock.broadcast.emit("newUser", user);
            this.users.add(user);
            succeeded(true);
        });
        sock.on("newMessage", (msg) => {
            sock.broadcast.emit("newMessage", msg);
            console.log("[", msg.username, "] ", msg.message);
        });
        sock.on("getUsers", (_, callback) => {
            callback(Array.from(this.users));
        });
        sock.on("disconnect", () => {
            if (socketUser != undefined && this.users.has(socketUser)) {
                const u = socketUser;
                socketUser = undefined;
                this.users.delete(u);
                sock.broadcast.emit("userDisconnected", u);
            }
            console.log("[", socketUser, "] disconnected");
        });
    }
}
