import React, {useContext, useEffect} from "react";
import {Route, Routes} from "react-router";
import {useDispatch} from "react-redux";
import {ServiceContext} from "../../index";
import {updateSession} from "../../redux/slice/AppSlice";
import {Chat} from "../chat/Chat";

export const App = () => {

    const NAV_ROUTE = {
        DEFAULT: "/"
    };

    const {socket, rtc} = useContext(ServiceContext);

    const dispatch = useDispatch();

    useEffect(() => {
        socket.connect();
        rtc.initialize();
        const subscription = rtc.session.subscribe(session => {
            dispatch(updateSession(session));
        });
        return () => {
            subscription.unsubscribe();
            rtc.dispose();
            socket.disconnect();
        }
    }, []);

    return (
        <Routes>
            <Route path={NAV_ROUTE.DEFAULT} element={<Chat/>}/>
        </Routes>
    );
}