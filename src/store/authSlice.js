import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../services/authService";

const initialState = {
    token: null,
}
const name = "auth";
export const fetchLogin = createAsyncThunk(`${name}/fetchLogin`, async (params = {}) => {
    try {
        const res = await authService.login(params);
        console.log("res", res);
        
        const token = res.data;
        return {
            ok: true,
            data: {
                token,
            }
        };
    } catch {
        return {
            ok: false,
            message: 'Thông tin đăng nhập của bạn không đúng!'
        }
    }
});

export const fetchRegister = createAsyncThunk(`${name}/fetchRegister`, async (params = {}) => {
    try {
        const res = await authService.register(params);
        return {
            ok: true,
            data: res.data
        };
    } catch {
        return {
            ok: false,
            message: 'Đăng ký không thành công!'
        };
    }
});


const authSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchLogin.fulfilled, (state, action) => {
            if (action.payload.ok) {
                state.token = action.payload.data.token;
                localStorage.setItem("ACCESS_TOKEN", JSON.stringify(state.token));
                // Store user info for sidebar display
                if (state.token.username) {
                    // Try to get userId from: 1) token response object, 2) JWT claims
                    let userId = state.token.userId || state.token.id || null;
                    if (!userId) {
                        try {
                            const jwtPayload = JSON.parse(atob(state.token.token.split('.')[1]));
                            userId = jwtPayload.nameid || jwtPayload.sub || jwtPayload.userId || jwtPayload.Id || jwtPayload.id;
                        } catch (e) { console.log('JWT decode error', e); }
                    }
                    localStorage.setItem("USER_INFO", JSON.stringify({
                        id: userId ? Number(userId) : null,
                        username: state.token.username,
                        email: state.token.email,
                        roleId: state.token.roleId,
                    }));
                }
            }
        });
        builder.addCase(fetchRegister.fulfilled, (state, action) => {
            if (action.payload.ok) {
                state.token = null;
            }
        });
    },
})

export default authSlice.reducer;