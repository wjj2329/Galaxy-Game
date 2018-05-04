
// https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-307871458
type Diff<T extends string, U extends string> =
    ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];
type Overwrite<T, U> = {[P in Diff<keyof T, keyof U>]: T[P]} & U;

type apiSignature = { req?: any, res?: any }

export interface SocketAPI {
    [messageName: string]: apiSignature
}

export type StandardSocketAPI = {
    message: { req?: any, res?: any }
    disconnect: { req?: string, res?: void }
}

type SocketTypedMethods<APIDef extends SocketAPI> = {
    on<APIMessage extends keyof APIDef>(
        event: APIMessage,
        listener: (
            data?: APIDef[APIMessage]["req"],
            callback?: (response: APIDef[APIMessage]["res"]) => void)
            => void
    ): void;
    emit<APIMessage extends keyof APIDef>(
        event: APIMessage,
        data?: APIDef[APIMessage]["req"],
        callback?: (response: APIDef[APIMessage]["res"]) => void
    ): void
};

type TypedSocketT<APIDef extends SocketAPI> =
    Overwrite<
        Overwrite<SocketIO.Socket, SocketTypedMethods<APIDef>>,
        {broadcast: Overwrite<SocketIO.Socket, SocketTypedMethods<APIDef>>}
    >;

type TypedClientSocketT<APIDef extends SocketAPI> =
        Overwrite<SocketIOClient.Socket, SocketTypedMethods<APIDef>>;

export interface TypedSocket<APIDef extends SocketAPI> extends TypedSocketT<APIDef> {
}

export interface TypedClientSocket<APIDef extends SocketAPI> extends TypedClientSocketT<APIDef> {
}

