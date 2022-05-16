import {combineReducers} from "redux";
import HomeSlice from "../slice/HomeSlice";
import AppSlice from "../slice/AppSlice";
import ChatSlice from "../slice/ChatSlice";

export const RootReducer = combineReducers({
    app: AppSlice,
    home: HomeSlice,
    chat: ChatSlice
});