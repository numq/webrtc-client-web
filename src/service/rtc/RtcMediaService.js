export const RtcMediaService = peer => (() => {

    const stream = peer.stream;

    const addTrack = peer.addTrack;

    const toggleAudio = state => {
        if (stream.value != null) {
            stream.value.getAudioTracks()[0].enabled = state
        }
    };

    const toggleVideo = state => {
        if (stream.value != null) {
            stream.value.getVideoTracks()[0].enabled = state;
        }
    };

    return {
        stream: stream,
        addTrack: addTrack,
        toggleAudio: toggleAudio,
        toggleVideo: toggleVideo
    };
})(RtcMediaService || {});