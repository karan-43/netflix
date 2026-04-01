import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant"

export const registerData = createAsyncThunk(
    "register/register",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}${API_ROUTES.register}`, data, {
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

const registerSlice = createSlice({
    name: "register",
    initialState: {
        register: {
            loading: false,
            error: null,
            data: null
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(registerData.pending, (state) => {
            state.register.loading = true,
                state.register.error = null
        })
        builder.addCase(registerData.fulfilled, (state, action) => {
            state.register.loading = false;
            state.register.error = null;
            state.register.data = action.payload;
        })
        builder.addCase(registerData.rejected, (state, action) => {
            state.register.loading = false,
                state.register.error = action.payload
        })
    }
});

export default registerSlice.reducer;