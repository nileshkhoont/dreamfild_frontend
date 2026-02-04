import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiService';
import { taskApi } from './API/taskApi';
import { organizationApi } from './API/organization';
import { notificationApi } from './API/notification'; // <-- Import notificationApi
import { assetsApi } from './API/assets';

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        [taskApi.reducerPath]: taskApi.reducer,
        [organizationApi.reducerPath]: organizationApi.reducer,
        [notificationApi.reducerPath]: notificationApi.reducer,
        [assetsApi.reducerPath]: assetsApi.reducer, // <-- Add assetsApi reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            apiSlice.middleware,
            taskApi.middleware,
            organizationApi.middleware,
            notificationApi.middleware,
            assetsApi.middleware, // <-- Add assetsApi middleware
        ),
});

export default store;