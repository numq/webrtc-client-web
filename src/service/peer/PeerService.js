import {BehaviorSubject, Subject} from "rxjs";

export const PeerService = signaling => (() => {

    const createConnection = () => new RTCPeerConnection({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceServers: [{urls: ["stun:stun.stunprotocol.org:3478", "stun:stun.l.google.com:19302"]}]
    });

    const DEFAULT_CHANNEL = "default";

    const connection = new BehaviorSubject(null);
    const dataChannel = new BehaviorSubject(null);

    const negotiationNeeded = new Subject();
    const stream = new Subject();
    const iceCandidates = new Subject();
    const messages = new Subject();

    const create = () => {

        const peer = createConnection();

        peer.addEventListener("track", ({streams}) => {
            console.log("TRACK", streams[0])
            stream.next(streams[0]);
        })
        peer.addEventListener("icecandidate", ({candidate}) => {
            if (candidate) {
                iceCandidates.next(candidate);
            }
        });
        peer.addEventListener("negotiationneeded", ev => {
            negotiationNeeded.next(ev);
        });
        peer.addEventListener("datachannel", ({channel}) => {
            dataChannel.next(channel);
        })
        connection.next(peer);

        const newChannel = peer.createDataChannel(DEFAULT_CHANNEL);
        newChannel.addEventListener("message", ({data}) => {
            messages.next(data);
        });
        dataChannel.next(newChannel);
    };

    const close = () => {
        dataChannel.value?.close();
        connection.value?.close();
        dataChannel.next(null);
        connection.next(null);
    };

    const addTrack = (track, stream) => connection.value?.addTrack(track, stream);

    const sendMessage = data => {
        if (dataChannel.value?.readyState === 'open') {
            dataChannel.value.send(JSON.stringify(data))
        }
    };

    const sendOffer = id => {
        connection.value?.createOffer().then(description => {
            connection.value.setLocalDescription(description).then(() => {
                signaling.offer(id, description.sdp);
            }).catch(console.error);
        });
    };

    const sendAnswer = id => {
        connection.value?.createAnswer().then(description => {
            connection.value.setLocalDescription(description).then(() => {
                signaling.answer(id, description.sdp);
            }).catch(console.error);
        });
    };

    const onIceCandidateReceived = (sdpMid, sdpMLineIndex, sdp) => {
        const iceCandidate = new RTCIceCandidate({
            sdpMid: sdpMid,
            sdpMLineIndex: sdpMLineIndex,
            sdp: sdp
        });
        return connection.value?.addIceCandidate(iceCandidate);
    };

    const onOfferReceived = (id, description) => {
        const sdp = new RTCSessionDescription({type: "offer", sdp: description});
        connection.value?.setRemoteDescription(sdp).then(() => sendAnswer(id)).catch(console.error);
    };

    const onAnswerReceived = description => {
        const sdp = new RTCSessionDescription({type: "answer", sdp: description});
        connection.value?.setRemoteDescription(sdp).then(() => {
            console.log("Peer connection state: %s", connection.value.connectionState);
        }).catch(console.error);
    };

    return {
        negotiationNeeded: negotiationNeeded,
        stream: stream,
        iceCandidates: iceCandidates,
        messages: messages,
        create: create,
        close: close,
        addTrack: addTrack,
        sendMessage: sendMessage,
        sendOffer: sendOffer,
        sendAnswer: sendAnswer,
        onIceCandidateReceived: onIceCandidateReceived,
        onOfferReceived: onOfferReceived,
        onAnswerReceived: onAnswerReceived
    };
})(PeerService || {});