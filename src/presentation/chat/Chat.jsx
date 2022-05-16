import {useContext, useEffect, useRef, useState} from "react";
import {ServiceContext} from "../../index";
import {Box, Card, Divider, IconButton, Input, List, Paper, Stack, Typography} from "@mui/material";
import {LoadingButton} from "../common/LoadingButton";
import {
    CallEndRounded,
    ClearRounded,
    MicOffRounded,
    MicRounded,
    SendRounded,
    VideocamOffRounded,
    VideocamRounded
} from "@mui/icons-material";
import {Message} from "../../domain/Message";
import {useSelector} from "react-redux";

export const Chat = () => {

    const {rtc, rtcMedia} = useContext(ServiceContext);

    const localRef = useRef(null);
    const remoteRef = useRef(null);
    const localStream = localRef.current?.srcObject
    const listEndRef = useRef(null)

    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);

    const session = useSelector(state => {
        console.log(state);
        return state.app.session;
    });

    const [inputText, setInputText] = useState("");
    const clearInput = () => setInputText("");

    const subscriptions = useRef([]);
    const [messages, setMessages] = useState([]);
    const sendMessage = () => ((message, onResult) => {
        rtc.sendMessage(message);
        setMessages(prev => ([...prev, message]))
        onResult();
    })(Message(session.clientId, inputText), clearInput);

    const [micEnabled, setMicEnabled] = useState(true);
    const [camEnabled, setCamEnabled] = useState(true);

    const toggleMic = () => {
        setMicEnabled(!micEnabled);
        rtcMedia.toggleAudio(micEnabled);
    };

    const toggleCam = () => {
        setCamEnabled(!camEnabled);
        rtcMedia.toggleAudio(camEnabled);
    };

    const request = () => {
        rtc.requestSession();
        setConnecting(true);
    };

    const cancel = () => {
        rtc.leaveSession();
        setConnecting(false);
    };

    const nextStranger = () => {
        rtc.leaveSession();
    };

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            audio: true, video: {
                width: {min: 160, ideal: 640, max: 1280},
                height: {min: 120, ideal: 360, max: 720}
            }
        }).then(local => {
            localRef.current.srcObject = local;
        }).catch(console.error);
        subscriptions.current.push(
            ...[
                rtc.messages.subscribe(msg => {
                    setMessages(prev => [...prev, msg]);
                }),
                rtcMedia.stream.subscribe(stream => {
                    remoteRef.current.srcObject = stream;
                })
            ]
        );
        return () => {
            subscriptions.current.forEach(s => s.unsubscribe());
            subscriptions.current.length = 0;
        }
    }, []);

    useEffect(() => {
        setConnected(session !== null);
    }, [session]);

    useEffect(() => {
        if (connected) {
            setConnecting(false);
            rtc.joinSession(session);
            rtc.prepareChat(session);
            localStream?.getTracks().forEach(track => rtcMedia.addTrack(track, localStream));
            setMessages(prev => ([...prev, ...Array(10).fill(Message(session?.senderId, "test"))]));
        } else {
            rtc.disposeChat();
            rtc.leaveSession();
            setMessages([]);
        }
    }, [connected])

    const scrollToBottom = () => {
        listEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
        })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    const MessageItem = (userId, idx, msg) => (
        <Box sx={{display: "flex"}} justifyContent={userId === msg.senderId ? "end" : "start"} key={msg.sentAt + idx}>
            <Card sx={{margin: "4px", minWidth: "15vw", maxWidth: "55vw"}}>
                <Stack direction={"column"} justifyItems={"center"} paddingX={"8px"}>
                    <Stack direction={"column"} sx={{objectFit: "contain"}}>
                        <Typography variant={"h6"}>{msg.senderId}</Typography>
                        <Divider/>
                    </Stack>
                    <Typography variant={"body1"}>{msg.text}</Typography>
                    <Box alignSelf={"end"}>
                        <Typography justifySelf={"end"}
                                    variant={"body2"}>{new Date(msg.sentAt).toDateString()}
                        </Typography>
                    </Box>
                </Stack>
            </Card>
        </Box>);

    return (
        <Stack direction={"column"} height="95vh" justifyContent={"space-between"}>
            <Paper component={Stack} direction="column" sx={{padding: "8px", height: "100%"}}>
                <Stack direction={{sx: "column", sm: "column", md: "column", lg: "row"}}
                       spacing={2}>
                    {
                        camEnabled ? <>
                            <Stack direction={"column"} width={"100%"}
                                   display={{sx: "none", sm: "none", md: "none", lg: "inherit"}}>
                                <Box alignSelf={"center"}>
                                    <Typography variant={"h6"}>You</Typography>
                                </Box>
                                <video ref={localRef} controls autoPlay muted/>
                            </Stack>
                        </> : null
                    }
                    <Stack direction={"column"} width={"100%"} justifyContent={"center"}>
                        {
                            connected ? <>
                                <Box alignSelf={"center"}>
                                    <Typography variant={"h6"}>Stranger</Typography>
                                </Box>
                                <video ref={remoteRef} controls autoPlay muted/>
                            </> : <>
                                <Box alignSelf={"center"} margin={"16px"}>
                                    <LoadingButton trigger={connecting} start={request} cancel={cancel}/>
                                </Box>
                            </>
                        }
                    </Stack>
                </Stack>
                <Box display={"flex"} alignSelf={"center"} justifySelf={"center"} marginTop={"8px"}>
                    <Card>
                        <Stack direction={"row"}>
                            <IconButton onClick={toggleMic}>
                                {
                                    micEnabled ? <MicRounded/> : <MicOffRounded/>
                                }
                            </IconButton>
                            <IconButton onClick={toggleCam}>
                                {
                                    camEnabled ? <VideocamRounded/> : <VideocamOffRounded/>
                                }
                            </IconButton>
                            <IconButton onClick={nextStranger} sx={{color: "red"}}>
                                {
                                    connected ? <CallEndRounded/> : null
                                }
                            </IconButton>
                        </Stack>
                    </Card>
                </Box>
            </Paper>
            {
                connected ? <>
                    <Stack direction="column"
                           sx={{marginTop: "16px", padding: "8px"}}>
                        <List sx={{overflow: "scroll", height: "30vh", flexDirection: "column-reverse"}}>
                            {messages.map((msg, idx) => MessageItem(session?.clientId, idx, msg))}
                            <div ref={listEndRef}/>
                        </List>
                        <Stack direction={"row"} justifyItems={"center"} alignItems={"center"} spacing={2}>
                            <Input sx={{width: "100%"}}
                                   inputMode="text"
                                   value={inputText}
                                   placeholder={"Type message here.."}
                                   onChange={({target}) => setInputText(target.value)}
                                   endAdornment={inputText.length > 0 ? (
                                       <ClearRounded onClick={clearInput}/>) : null}/>
                            <IconButton disabled={inputText.length < 1} onClick={sendMessage}>{
                                <SendRounded/>}</IconButton>
                        </Stack>
                    </Stack>
                </> : null
            }
        </Stack>
    );
};