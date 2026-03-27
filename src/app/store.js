import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "../features/homeSlice/homeSlice.js"
import videoDetailReducer from "../features/videoDetailSlice/videoDetailSlice.js"

export const store = configureStore({
    reducer: {
        home: homeReducer,
        videoDetail: videoDetailReducer
    },
});