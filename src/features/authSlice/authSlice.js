import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant";

const newAuthData = () => {
    return localStorage.getItem("token") || null
}

export const profileData = createAsyncThunk(
    "profile/profile",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}${API_ROUTES.profile}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log(res?.data, "profile")
            return res?.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: newAuthData(),
        user: null,
        loading: false,
        error: null,
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
        },
        removeToken: (state) => {
            state.token = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(profileData.pending, (state) => {
            state.loading = true,
                state.error = null
        })
        builder.addCase(profileData.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload;
        })
        builder.addCase(profileData.rejected, (state, action) => {
            state.loading = false,
                state.error = action.payload
        })
    }
});

export const { setToken } = authSlice.actions;

export default authSlice.reducer;