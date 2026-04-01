import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL, API_ROUTES } from "../../constant/apiConstant"



export const basicDetails = createAsyncThunk(
    "basicDetails/basicDetails",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}${API_ROUTES.basicDetails}`, data, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            console.log(res?.data?.data, "basicDetails success");
            return res?.data;


        } catch (error) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

const basicDetailsSlice = createSlice({
    name: "basicDetails",
    initialState: {
        basicDetailsData: {
            loading: false,
            error: null,
            data: null

        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(basicDetails.pending, (state) => {
            state.basicDetailsData.loading = true,
                state.basicDetailsData.error = null
        })
        builder.addCase(basicDetails.fulfilled, (state, action) => {
            state.basicDetailsData.loading = false;
            state.basicDetailsData.error = null;
            state.basicDetailsData.data = action.payload.data;
        })
        builder.addCase(basicDetails.rejected, (state, action) => {
            state.basicDetailsData.loading = false,
                state.basicDetailsData.error = action.payload
        })
    }
});

export default basicDetailsSlice.reducer;