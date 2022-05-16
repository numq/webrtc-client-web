import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    session: null
};

const AppSlice = createSlice({
    name: "app",
    initialState: initialState,
    reducers: {
        updateSession: (state, action) => {
            return {...state, session: action.payload}
        }
    }
});

export const {updateSession} = AppSlice.actions;

export default AppSlice.reducer;