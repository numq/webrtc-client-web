import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    session: null,
    localStream: null,
    remoteStream: null,
    messages: [],
    isAudioEnabled: true,
    isVideoEnabled: true,
    isChatEnabled: true
};

const ChatSlice = createSlice({
    name: "chat",
    initialState: initialState,
    reducers: {
        updateSession: (state, action) => {
            return {...state, session: action.payload};
        },
        addMessage: (state, action) => {
            return {...state, messages: state.messages.concat(action.payload)};
        },
        updateLocalStream: (state, action) => {
            return {...state, localStream: action.payload};
        },
        clearLocalStream: state => {
            return {...state, localStream: null};
        },
        updateRemoteStream: (state, action) => {
            return {...state, remoteStream: action.payload};
        },
        clearRemoteStream: state => {
            return {...state, remoteStream: null};
        },
        leave: () => {
            return initialState;
        },
        toggleAudio: (state, action) => {
            return {...state, isAudioEnabled: action.payload};
        },
        toggleVideo: (state, action) => {
            return {...state, isVideoEnabled: action.payload};
        },
        toggleChat: state => {
            return {...state, isChatEnabled: !state.isChatEnabled};
        }
    }
})

export const {
    updateSession,
    addMessage,
    updateLocalStream,
    clearLocalStream,
    updateRemoteStream,
    clearRemoteStream,
    leave,
    toggleAudio,
    toggleVideo,
    toggleChat
} = ChatSlice.actions;

export default ChatSlice.reducer;