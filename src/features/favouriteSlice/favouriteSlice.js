import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant"

export const getFavouriteList = createAsyncThunk(
    "favourite/favourite",
    async ({ categoryId }, { rejectWithValue }) => {

        try {
            const url = categoryId ? `${API_ROUTES.getFavouriteVideo}?categoryId=${categoryId}` : API_ROUTES.getFavouriteVideo;
            const res = await axios.get(`${BASE_URL}${url}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            console.log(res?.data, "ressssss")
            return res?.data;

        }
        catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }

);

export const addFavouriteList = createAsyncThunk(
    "addFavourite/addFavourite",
    async ({ videoId }, { rejectWithValue }) => {
        try {

            const res = await axios.post(`${BASE_URL}${API_ROUTES.addFavouriteVideo}`, { videoId: videoId }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            return res?.data
        }
        catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);



const favouriteSlice = createSlice({
    name: "favourite",
    initialState: {
        favourite: {
            loading: false,
            error: null,
            data: []
        },
        addFavourite: {
            loading: false,
            error: null,
            data: null
        }

    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(getFavouriteList.pending, (state) => {
            state.favourite.loading = true;
            state.favourite.error = null;
        })
        builder.addCase(getFavouriteList.fulfilled, (state, action) => {
            state.favourite.loading = false;
            state.favourite.error = null;
            state.favourite.data = action.payload.data;

        })
        builder.addCase(getFavouriteList.rejected, (state, action) => {
            state.favourite.loading = false;
            state.favourite.error = action.payload.data;
        })

        builder.addCase(addFavouriteList.pending, (state) => {
            state.addFavourite.loading = true;
            state.addFavourite.error = null;
        })
        builder.addCase(addFavouriteList.fulfilled, (state, action) => {
            state.addFavourite.loading = false;
            state.addFavourite.error = null;
            state.addFavourite.data = action.payload.data;

        })
        builder.addCase(addFavouriteList.rejected, (state, action) => {
            state.addFavourite.loading = false;
            state.addFavourite.error = action.payload.data;
        })



    }
});

export default favouriteSlice.reducer;