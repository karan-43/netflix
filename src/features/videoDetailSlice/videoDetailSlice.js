import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant"

export const getVideoDetail = createAsyncThunk(
    "videoDetail/getVideoDetail",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}${API_ROUTES.videoDetail}/${id}`, {
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

const videoDetailSlice = createSlice({
    name: "videoDetail",
    initialState: {
        videoDetail: {
            loading: false,
            error: null,
            data: null
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getVideoDetail.pending, (state) => {
            state.videoDetail.loading = true,
                state.videoDetail.error = null
        })
        builder.addCase(getVideoDetail.fulfilled, (state, action) => {
            state.videoDetail.loading = false;
            state.videoDetail.error = null;
            state.videoDetail.data = action.payload;
        })
        builder.addCase(getVideoDetail.rejected, (state, action) => {
            state.videoDetail.loading = false,
                state.videoDetail.error = action.payload
        })
    }
});

export default videoDetailSlice.reducer;