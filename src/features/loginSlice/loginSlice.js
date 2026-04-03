import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant"

export const loginData = createAsyncThunk(
    "login/login",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}${API_ROUTES.login}`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log(res?.data, "res?.data know")
            return res?.data;


        } catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

const loginSlice = createSlice({
    name: "login",
    initialState: {
        login: {
            loading: false,
            error: null,
            data: null
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loginData.pending, (state) => {
            state.login.loading = true,
                state.login.error = null
        })
        builder.addCase(loginData.fulfilled, (state, action) => {
            state.login.loading = false;
            state.login.error = null;
            state.login.data = action.payload;
        })
        builder.addCase(loginData.rejected, (state, action) => {
            state.login.loading = false,
                state.login.error = action.payload
        })
    }
});

export default loginSlice.reducer;