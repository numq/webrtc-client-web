import {useContext, useEffect, useRef, useState} from "react";
import {ServiceContext} from "../../index";
import {Box, Card, Divider, IconButton, Input, List, Stack, Typography} from "@mui/material";
import {LoadingButton} from "../common/LoadingButton";
import {CallEndRounded, ClearRounded, SendRounded} from "@mui/icons-material";
import {Message} from "../../domain/Message";
import {useSelector} from "react-redux";

export const Chat = () => {

    const {rtc, rtcMedia} = useContext(ServiceContext);

    const localRef = useRef(null);
    const localStream = localRef.current?.srcObject;
    const remoteRef = useRef(null);
    const listEndRef = useRef(null)

    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);

    const session = useSelector(state => state.app.session);

    const [inputText, setInputText] = useState("");
    const clearInput = () => setInputText("");

    const subscriptions = useRef([]);
    const [messages, setMessages] = useState([]);
    const sendMessage = () => ((message, onResult) => {
        rtc.sendMessage(message);
        setMessages(prev => ([...prev, message]))
        onResult();
    })(Message(session.clientId, inputText), clearInput);

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
    }, [])

    useEffect(() => {
        setConnected(session !== null);
    }, [session]);

    useEffect(() => {
        if (connected) {
            setConnecting(false);
            rtc.joinSession(session);
            rtc.prepareChat(session);
            localStream?.getTracks().forEach(track => rtcMedia.addTrack(track, localStream));
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
            <Stack direction={{sx: "column", sm: "column", md: "column", lg: "row"}}
                   sx={{padding: "8px"}}
                   spacing={2}>
                <Stack direction={"column"} width={"100%"}
                       display={{sx: "none", sm: "none", md: "none", lg: "inherit"}}>
                    <Box alignSelf={"center"}>
                        <Typography variant={"h6"}>You</Typography>
                    </Box>
                    <video height="500px" ref={localRef} autoPlay muted/>
                    {
                        connected ?
                            <Box display={"flex"} alignSelf={"center"} justifySelf={"center"}>
                                <Card>
                                    <IconButton onClick={nextStranger} sx={{color: "red"}}>
                                        <CallEndRounded/>
                                    </IconButton>
                                </Card>
                            </Box>
                            : null
                    }
                </Stack>
                <Stack direction={"column"} width={"100%"} justifyContent={"center"}>
                    {
                        connected ? <>
                            <Box alignSelf={"center"}>
                                <Typography variant={"h6"}>Stranger</Typography>
                            </Box>
                            <video height="500px" ref={remoteRef} autoPlay muted/>
                        </> : <>
                            <Box alignSelf={"center"} margin={"16px"}>
                                <LoadingButton trigger={connecting} start={request} cancel={cancel}/>
                            </Box>
                        </>
                    }
                </Stack>
            </Stack>
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
                </> : <></>
            }
        </Stack>
    );
};