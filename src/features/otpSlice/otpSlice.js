import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant"



export const verifyOtp = createAsyncThunk(
    "otp/otp",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}${API_ROUTES.otp}`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(res?.data?.data, "otp verification success");
            return res?.data;


        } catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

const otpSlice = createSlice({
    name: "otp",
    initialState: {
        otp: {
            loading: false,
            error: null,

        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(verifyOtp.pending, (state) => {
            state.otp.loading = true,
                state.otp.error = null
        })
        builder.addCase(verifyOtp.fulfilled, (state, action) => {
            state.otp.loading = false;
            state.otp.error = null;
            state.otp.data = action.payload.data;
        })
        builder.addCase(verifyOtp.rejected, (state, action) => {
            state.otp.loading = false,
                state.otp.error = action.payload
        })
    }
});

export default otpSlice.reducer;