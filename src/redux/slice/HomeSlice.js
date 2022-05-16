import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    isConnecting: false
}

const HomeSlice = createSlice({
    name: "home",
    initialState: initialState,
    reducers: {
        request: state => {
            state.isConnecting = true;
        },
        cancel: state => {
            state.isConnecting = false;
        }
    }
});

export const {request, cancel} = HomeSlice.actions;

export default HomeSlice.reducer;