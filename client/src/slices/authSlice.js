import { createSlice } from "@reduxjs/toolkit";
import { checkAuth, loginUser, registerUser, logoutUser } from "../thunks/authThunks";

const initialState = {
    user: null,
    userId: null,
    isLogged: false,
    loading: true,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.pending, (state) => {
            state.user = null;
            state.userId = null;
            state.isLogged = false;
            state.loading = true;
            state.error = null;
        })
        .addCase(loginUser.rejected, (state, action)=> {
            state.user = null;
            state.userId = null;
            state.isLogged = false;
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(loginUser.fulfilled, (state,action) => {
            state.user = action.payload.data?.email;
            state.userId = action.payload.data?.userId;
            state.isLogged = action.payload.data?.isLogged ?? false;
            state.loading = false;
            state.error = null;
        })
        .addCase(checkAuth.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(checkAuth.rejected, (state, action) => {
            state.user = null;
            state.userId = null;
            state.isLogged = false;
            state.loading = false;
            state.error = null;
        })
        .addCase(checkAuth.fulfilled, (state, action) => {
            if (action.payload.data?.isLogged) {
                state.user = action.payload.data?.email;
                state.userId = action.payload.data?.userId;
                state.isLogged = true;
                state.loading = false;
                state.error = null;
            } else {
                state.user = null;
                state.userId = null;
                state.isLogged = false;
                state.loading = false;
                state.error = null;
            }
        })
        .addCase(registerUser.pending, (state) => {
            state.user = null;
            state.userId = null;
            state.isLogged = false;
            state.loading = true;
            state.error = null;
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.user = null;
            state.userId = null;
            state.isLogged = false;
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.user = action.payload.data?.email;
            state.userId = action.payload.data?.userId;
            state.isLogged = true;
            state.loading = false;
            state.error = null;
        })
        .addCase(logoutUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(logoutUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(logoutUser.fulfilled, (state, action) => {
            if (action.payload.data?.isLogged === false) {
                state.user = null;
                state.userId = null;
                state.isLogged = false;
                state.loading = false;
                state.error = null;
            } else {
                state.loading = false;
                state.error = action.payload;
            }
        })
    }
});


export const { clearError } = authSlice.actions;
export default authSlice.reducer;