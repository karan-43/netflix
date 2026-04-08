import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant"

export const addVideoToContinueWatching = createAsyncThunk(
    "continueWatching/addVideoToContinueWatching",
    async ({ videoId, watchDuration, progress }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}${API_ROUTES.continueWatching}`, { videoId, watchDuration, progress }, {
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

const continueWatchingSlice = createSlice({
    name: "continueWatching",
    initialState: {
        continueWatchingVideos: {
            loading: false,
            error: null,
            data: []
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addVideoToContinueWatching.pending, (state) => {
            state.continueWatchingVideos.loading = true,
                state.continueWatchingVideos.error = null
        })
        builder.addCase(addVideoToContinueWatching.fulfilled, (state, action) => {
            state.continueWatchingVideos.loading = false;
            state.continueWatchingVideos.error = null;
            state.continueWatchingVideos.data = action.payload;
        })
        builder.addCase(addVideoToContinueWatching.rejected, (state, action) => {
            state.continueWatchingVideos.loading = false,
                state.continueWatchingVideos.error = action.payload
        })
    }
});

export default continueWatchingSlice.reducer;
