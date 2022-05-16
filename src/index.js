import React, {createContext} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from "./presentation/app/App";
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";
import {configureServices} from "./service";
import {RootReducer} from "./redux/reducer/RootReducer";
import {ChatMiddleware} from "./redux/middleware/ChatMiddleware";
import {AppMiddleware} from "./redux/middleware/AppMiddleware";
import {HomeMiddleware} from "./redux/middleware/HomeMiddleware";

const container = document.getElementById('root');
const root = createRoot(container);
const services = configureServices();
export const ServiceContext = createContext({});
const store = configureStore({
    reducer: RootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: {
                extraArgument: {
                    services: services
                }
            }
        }).concat([AppMiddleware, HomeMiddleware, ChatMiddleware])
});

root.render(
    <ServiceContext.Provider value={services}>
        <Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider>
    </ServiceContext.Provider>
)
