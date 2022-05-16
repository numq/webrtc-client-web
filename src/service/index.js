import {SocketService} from "./socket/SocketService";
import {SignalingService} from "./signaling/SignalingService";
import {PeerService} from "./peer/PeerService";
import {RtcService} from "./rtc/RtcService";
import {RtcMediaService} from "./rtc/RtcMediaService";

export const configureServices = () => {

    const SOCKET_URI = "ws://192.168.1.67:8080";
    const socket = SocketService(SOCKET_URI);
    const signaling = SignalingService(socket);
    const peer = PeerService(signaling);
    const rtcMedia = RtcMediaService(peer);
    const rtc = RtcService(socket, signaling, peer);

    return {
        socket: socket, signaling: signaling, peer: peer, rtc: rtc, rtcMedia: rtcMedia
    };
}