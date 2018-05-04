
import { TypedClientSocket, SocketAPI } from "shared/socketApi";
import { ChatApi, User, Message } from "shared/chatApi";

import * as io from "socket.io-client";
import {Observable} from "rxjs/Observable";

interface SocketEvent<APIDef extends SocketAPI, M extends keyof APIDef> {
    data: APIDef[M]["req"]
    callback?: (response: APIDef[M]["res"]) => void
}

export default class SocketService<APIDef extends SocketAPI> {
    sock: TypedClientSocket<APIDef>;

    constructor(uri?: string, opts?: any) {
        this.sock = io(uri, opts);
    }

    on<M extends keyof APIDef>(event: M): Observable<SocketEvent<APIDef, M>> {
        return new Observable<SocketEvent<APIDef, M>>(observer => {
            this.sock.on(event, (data, callback) => {
                observer.next({data: data, callback: callback});
            })
        });
    }
}