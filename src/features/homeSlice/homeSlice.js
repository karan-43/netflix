import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant"

export const getVideo = createAsyncThunk(
    "homeVideo/getVideo",
    async (id = null, { rejectWithValue }) => {
        try {
            const url = id
                ? `${BASE_URL}${API_ROUTES.home}?categoryId=${id}`
                : `${BASE_URL}${API_ROUTES.home}`;

            const res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            return res?.data?.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

const homeSlice = createSlice({
    name: "home",
    initialState: {
        homeVideos: {
            loading: false,
            error: null,
            data: []
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getVideo.pending, (state) => {
            state.homeVideos.loading = true,
                state.homeVideos.error = null
        })
        builder.addCase(getVideo.fulfilled, (state, action) => {
            state.homeVideos.loading = false;
            state.homeVideos.error = null;
            state.homeVideos.data = action.payload;
        })
        builder.addCase(getVideo.rejected, (state, action) => {
            state.homeVideos.loading = false,
                state.homeVideos.error = action.payload
        })
    }
});

export default homeSlice.reducer;
