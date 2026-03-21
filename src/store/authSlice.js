import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../services/authService";
import { getUserIdFromJwtString, resolveUserIdFromLoginToken } from "../utils/userInfo";

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
            message: 'Your login information is incorrect!'
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
            message: 'Registration was not successful!'
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
                    // 1) Login body fields  2) nested user  3) JWT claims (many ASP.NET claim types)
                    let userId =
                        state.token.userId ??
                        state.token.id ??
                        state.token.userID ??
                        state.token?.user?.id ??
                        state.token?.User?.id ??
                        null;
                    if (userId == null) {
                        userId = resolveUserIdFromLoginToken(state.token);
                    }
                    if (userId == null && state.token.token) {
                        userId = getUserIdFromJwtString(state.token.token);
                    }
                    const numericId =
                        userId != null && userId !== ''
                            ? Number(userId)
                            : null;
                    const safeId =
                        numericId != null && Number.isFinite(numericId) && numericId > 0
                            ? numericId
                            : null;
                    localStorage.setItem("USER_INFO", JSON.stringify({
                        id: safeId,
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