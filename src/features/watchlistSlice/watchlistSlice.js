import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant"

export const getWatchList = createAsyncThunk(
    "watchlist/watchlist",
    async (arg, { rejectWithValue }) => {
        // Handle both dispatch(getWatchList(id)) and dispatch(getWatchList({id: ...}))
        const id = typeof arg === 'object' ? arg?.id || arg?.addWatchListId : arg;

        try {
            const url = id ? `${BASE_URL}${API_ROUTES.watchlist}/${id}` : `${BASE_URL}${API_ROUTES.watchlist}`
            const res = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            return res?.data?.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }

);

export const addWatchListUser = createAsyncThunk(
    "watchlist/addWatchlistUser",
    async (data, { rejectWithValue }) => {
        try {

            const res = await axios.post(`${BASE_URL}${API_ROUTES.watchlist}`, data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            return res?.data?.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

export const deleteWatchList = createAsyncThunk(
    "watchlist/deleteWatchlist",
    async (id, { rejectWithValue }) => {
        try {

            const res = await axios.delete(`${BASE_URL}${API_ROUTES.watchlist}/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            return res?.data?.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);


export const addVideoWatchList = createAsyncThunk(
    "watchlist/addVideoWatchlist",
    async (data, { rejectWithValue }) => {
        try {

            const res = await axios.post(`${BASE_URL}${API_ROUTES.addVideoWatchlist}`, data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            return res?.data?.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

export const removeVideoWatchList = createAsyncThunk(
    "watchlist/removeVideoWatchlist",
    async (data, { rejectWithValue }) => {
        try {

            const res = await axios.post(`${BASE_URL}${API_ROUTES.removeVideoWatchlist}`, data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            return res?.data?.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

const watchlistSlice = createSlice({
    name: "watchlist",
    initialState: {
        watchlist: {
            loading: false,
            error: null,
            data: []
        },
        addWatchListUserData: {
            loading: false,
            error: null,
            data: []
        },
        addWatchList: {
            loading: false,
            error: null,
            data: []
        },
        watchListModalState: false

    },
    reducers: {
        clearWatchlist: (state) => {
            state.watchlist.data = [];
            state.watchlist.error = null;
            state.watchlist.loading = false;
        },
        watchListModalOpen: (state, action) => {
            state.watchListModalState = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getWatchList.pending, (state) => {
            state.watchlist.loading = true;
            state.watchlist.error = null;
        })
        builder.addCase(getWatchList.fulfilled, (state, action) => {
            state.watchlist.loading = false;
            state.watchlist.error = null;
            state.watchlist.data = action.payload;

        })
        builder.addCase(getWatchList.rejected, (state, action) => {
            state.watchlist.loading = false;
            state.watchlist.error = action.payload;
        })

        builder.addCase(addWatchListUser.pending, (state) => {
            state.addWatchListUserData.loading = true;
            state.addWatchListUserData.error = null;
        })
        builder.addCase(addWatchListUser.fulfilled, (state, action) => {
            state.addWatchListUserData.loading = false;
            state.addWatchListUserData.error = null;
            state.addWatchListUserData.data = action.payload;

        })
        builder.addCase(addWatchListUser.rejected, (state, action) => {
            state.addWatchListUserData.loading = false;
            state.addWatchListUserData.error = action.payload;
        })

        builder.addCase(addVideoWatchList.pending, (state) => {
            state.addWatchList.loading = true;
            state.addWatchList.error = null;
        })
        builder.addCase(addVideoWatchList.fulfilled, (state, action) => {
            state.addWatchList.loading = false;
            state.addWatchList.error = null;
            state.addWatchList.data = action.payload;

        })
        builder.addCase(addVideoWatchList.rejected, (state, action) => {
            state.addWatchList.loading = false;
            state.addWatchList.error = action.payload;
        })

    }
});

export const { clearWatchlist, watchListModalOpen } = watchlistSlice.actions;
export default watchlistSlice.reducer;