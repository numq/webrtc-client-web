import {Subject} from "rxjs";
import {webSocket} from "rxjs/webSocket";

export const SocketService = uri => (() => {

    const socket = webSocket(uri);
    const messages = new Subject();
    const connect = () => {
        socket.subscribe({
            next: msg => {
                messages.next(msg);
            },
            error: err => console.log(err),
            complete: () => console.log('Socket complete.')
        })
    };
    const disconnect = () => {
        socket.unsubscribe();
    }
    const signal = (type, body = {}) => {
        socket.next({type: type, body: body})
        console.log(`Sent message with type: ${type}`);
    };
    return {
        messages: messages,
        connect: connect,
        disconnect: disconnect,
        signal: signal
    };
})(SocketService || {});