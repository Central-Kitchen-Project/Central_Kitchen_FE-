import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../services/authService";
import { extractApiErrorMessage, extractApiMessage } from "../services/api";
import { getUserIdFromJwtString, resolveUserIdFromLoginToken } from "../utils/userInfo";

/** Wrong email or wrong password — single message. */
const LOGIN_FAILED_MESSAGE = "Incorrect email or password.";

/** Fallback if API body has no usable message*/
const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  "Password reset has been sent. Check your email for a reset link.";

const initialState = {
    token: null,
    forgotPasswordLoading: false,
    forgotPasswordMessage: null,
    forgotPasswordError: null,
    resetPasswordLoading: false,
    resetPasswordMessage: null,
    resetPasswordError: null,
}
const name = "auth";
export const fetchLogin = createAsyncThunk(`${name}/fetchLogin`, async (params = {}) => {
    try {
        const res = await authService.login(params);

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
            message: LOGIN_FAILED_MESSAGE,
        };
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

export const fetchForgotPassword = createAsyncThunk(
    `${name}/fetchForgotPassword`,
    async (params = {}, { rejectWithValue }) => {
        try {
            const res = await authService.forgotPassword(params);
            return extractApiMessage(
                res?.data,
                FORGOT_PASSWORD_SUCCESS_MESSAGE
            );
        } catch (error) {
            return rejectWithValue(
                extractApiErrorMessage(
                    error,
                    "Failed to send reset email. Please try again."
                )
            );
        }
    }
);

export const fetchResetPassword = createAsyncThunk(
    `${name}/fetchResetPassword`,
    async (params = {}, { rejectWithValue }) => {
        try {
            const res = await authService.resetPassword(params);
            return extractApiMessage(
                res?.data,
                "Password has been reset successfully."
            );
        } catch (error) {
            return rejectWithValue(
                extractApiErrorMessage(
                    error,
                    "Failed to reset password. Please try again."
                )
            );
        }
    }
);


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
        builder.addCase(fetchForgotPassword.pending, (state) => {
            state.forgotPasswordLoading = true;
            state.forgotPasswordError = null;
            state.forgotPasswordMessage = null;
        });
        builder.addCase(fetchForgotPassword.fulfilled, (state, action) => {
            state.forgotPasswordLoading = false;
            state.forgotPasswordMessage = action.payload;
            state.forgotPasswordError = null;
        });
        builder.addCase(fetchForgotPassword.rejected, (state, action) => {
            state.forgotPasswordLoading = false;
            state.forgotPasswordError = action.payload || "Failed to send reset email. Please try again.";
            state.forgotPasswordMessage = null;
        });
        builder.addCase(fetchResetPassword.pending, (state) => {
            state.resetPasswordLoading = true;
            state.resetPasswordError = null;
            state.resetPasswordMessage = null;
        });
        builder.addCase(fetchResetPassword.fulfilled, (state, action) => {
            state.resetPasswordLoading = false;
            state.resetPasswordMessage = action.payload;
            state.resetPasswordError = null;
        });
        builder.addCase(fetchResetPassword.rejected, (state, action) => {
            state.resetPasswordLoading = false;
            state.resetPasswordError = action.payload || "Failed to reset password. Please try again.";
            state.resetPasswordMessage = null;
        });
    },
})

export default authSlice.reducer;