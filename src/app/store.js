import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "../features/homeSlice/homeSlice.js"
import videoDetailReducer from "../features/videoDetailSlice/videoDetailSlice.js"
import registerReducer from "../features/registerSlice/registerSlice.js"
import otpReducer from "../features/otpSlice/otpSlice.js"
import authReducer from "../features/authSlice/authSlice.js"
import basicDetailsReducer from "../features/basicDetailsSlice/basicDetailsSlice.js"
import loginReducer from "../features/loginSlice/loginSlice.js"
import watchlistReducer from "../features/watchlistSlice/watchlistSlice.js"
import continueWatchingReducer from "../features/continueWatchingSlice/continueWatchingSlice.js"
import favouriteReducer from "../features/favouriteSlice/favouriteSlice.js"

export const store = configureStore({
    reducer: {
        home: homeReducer,
        videoDetail: videoDetailReducer,
        register: registerReducer,
        otp: otpReducer,
        auth: authReducer,
        basicDetails: basicDetailsReducer,
        login: loginReducer,
        watchlist: watchlistReducer,
        continueWatching: continueWatchingReducer,
        favourite: favouriteReducer
    },
});