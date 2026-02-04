import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const notificationBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/notification`, // Update base path for notifications
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
}); 

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: notificationBaseQuery,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotificationsByUserId: builder.query({
      query: (userId) => ({
        url: `user-notifications`,
        method: "POST",
        body: { userId }, // <-- Send userId in body
      }),
      providesTags: ["Notification"],
    }),
    getAllNotificationsByUserIdWithDeleted: builder.query({
      query: (userId) => ({
        url: `notifications/all`,
        method: "POST",
        body: { userId },
      }),
      providesTags: ["Notification"],
    }),
    softDeleteNotification: builder.mutation({
      query: (id) => ({
        url: `notifications`,
        method: "PATCH",
        body: { id },
      }),
      invalidatesTags: ["Notification"],
    }),
    markNotificationsAsRead: builder.mutation({
      query: (body) => ({
        url: `notifications/mark-read`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),

  }),
});

export const {
  useGetNotificationsByUserIdQuery,
  useGetAllNotificationsByUserIdWithDeletedQuery,
  useSoftDeleteNotificationMutation,
  useMarkNotificationsAsReadMutation,
} = notificationApi;
