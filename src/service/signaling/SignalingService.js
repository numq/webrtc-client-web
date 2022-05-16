import {MessageType} from "../type/MessageType";

export const SignalingService = socket => (() => {

    const request = () => socket.signal(MessageType.REQUEST);

    const leave = () => socket.signal(MessageType.LEAVE);

    const offer = (id, sdp) => socket.signal(MessageType.OFFER, {
        id: id,
        sdp: sdp
    });

    const answer = (id, sdp) => socket.signal(MessageType.ANSWER, {
        id: id,
        sdp: sdp
    });

    const candidate = (id, candidate) => socket.signal(MessageType.CANDIDATE, {
        id: id,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdp: candidate.candidate
    });

    return {
        request: request,
        leave: leave,
        offer: offer,
        answer: answer,
        candidate: candidate
    };
})(SignalingService || {});