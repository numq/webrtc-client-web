import {MessageType} from "../type/MessageType";
import {BehaviorSubject} from "rxjs";
import {Session} from "../../domain/Session";

export const RtcService = (socket, signaling, peer) => (() => {

    const subscriptions = [];
    const session = new BehaviorSubject(null);
    const messages = new BehaviorSubject([]);

    const initialize = () => {
        subscriptions.push(socket.messages.subscribe(({type, body}) => {
            console.log(`Got message with type: ${type}`);
            switch (type) {
                case MessageType.CONNECTED: {
                    const newSession = Session(body.sessionId, body.clientId, body.strangerId, body.isLastConnected);
                    session.next(newSession);
                    break;
                }
                case MessageType.DISCONNECTED: {
                    session.next(null);
                    break;
                }
                case MessageType.CANDIDATE: {
                    peer.onIceCandidateReceived(body.sdpMid, body.sdpMLineIndex, body.sdp);
                    break;
                }
                case MessageType.OFFER: {
                    peer.onOfferReceived(body.id, body.sdp);
                    break;
                }
                case MessageType.ANSWER: {
                    peer.onAnswerReceived(body.sdp);
                    break;
                }
            }
        }));
    };

    const dispose = () => {
        subscriptions.forEach(s => s.unsubscribe());
        subscriptions.length = 0;
    };

    const prepareChat = session => {

        const onIceCandidate = candidate => {
            signaling.candidate(session.strangerId, candidate);
        };

        const onNegotiationNeeded = () => {
            if (session.isLastConnected) peer.sendOffer(session.strangerId);
        };

        subscriptions.push(
            ...[
                peer.negotiationNeeded.subscribe(ev => {
                    onNegotiationNeeded();
                }),
                peer.iceCandidates.subscribe(candidate => {
                    onIceCandidate(candidate);
                }),
                peer.messages.subscribe(data => {
                    console.log("MESSAGE", data.toString())
                    const msg = JSON.parse(data);
                    console.log(`Got message: ${msg}`)
                    messages.next(msg);
                })
            ]
        );
    };

    const disposeChat = () => {
        peer.close();
        subscriptions.forEach(s => s.unsubscribe());
        subscriptions.length = 0;
    };

    const requestSession = () => {
        signaling.request();
    };

    const joinSession = session => {
        peer.create();
        if (session.isLastConnected) {
            peer.sendOffer(session.strangerId);
        }
    };

    const leaveSession = () => {
        signaling.leave();
    };

    const sendMessage = peer.sendMessage;

    return {
        session: session,
        messages: messages,
        initialize: initialize,
        dispose: dispose,
        prepareChat: prepareChat,
        disposeChat: disposeChat,
        requestSession: requestSession,
        joinSession: joinSession,
        leaveSession: leaveSession,
        sendMessage: sendMessage
    };
})(RtcService || {});