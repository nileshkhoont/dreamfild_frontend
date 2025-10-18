import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { add } from "date-fns";
import { de } from "date-fns/locale";
import { get } from "react-hook-form";

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/task`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery,
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "/create",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: ["Task"],
    }),
    
    getTasks: builder.query({
      query: (orgId) => ({
        url: "/all",
        method: "GET",
        params: orgId ? { orgId } : undefined,
      }),
      providesTags: ["Task"],
      // Use orgId as part of the cache key
      serializeQueryArgs: ({ queryArgs }) => {
        return queryArgs ? `getTasks-${queryArgs}` : 'getTasks';
      },
    }),

    getTaskById: builder.query({
      query: (taskId) => ({
        url: `/view-individual-task`,
        method: "POST",
        body: { taskId },
      }),
      providesTags: ["Task"],
    }),

    updateTask: builder.mutation({
      query: (taskData) => ({
        url: `/update-task`,
        method: "PATCH",
        body: taskData,
      }),
      invalidatesTags: ["Task"],
    }),

    specificUserTasks: builder.query({
      query: (userId) => ({
        url: `/get-by-user`,
        method: "POST",
        body: { userId },
      }),
      providesTags: ["Task"],
    }),

    deleteTask: builder.mutation({
      query: ({ taskId, isDeleted }) => ({
        url: `/delete-task`,
        method: "PATCH",
        body: { taskId, isDeleted },
      }),
      invalidatesTags: ["Task"],
    }),

    updateTaskStatus: builder.mutation({
      query: ({ taskId, status }) => ({
        url: `/update-task-status`,
        method: "PATCH",
        body: { taskId, status },
      }),
      invalidatesTags: ["Task"],
    }),

    addTaskComment: builder.mutation({
      query: ({ taskId, comment }) => ({
        url: `/add-comment`,
        method: "POST",
        body: { taskId, comment },
      }),
      invalidatesTags: ["Task"],
    }),

    startTaskTime: builder.mutation({
      query: ({ taskId }) => ({
        url: "/start-time",
        method: "POST",
        body: { taskId },
      }),
      invalidatesTags: ["Task"],
    }),
    endTaskTime: builder.mutation({
      query: ({ taskId }) => ({
        url: "/end-time",
        method: "POST",
        body: { taskId },
      }),
      invalidatesTags: ["Task"],
    }),

    // Add this mutation for replying to a comment
    replyToTaskComment: builder.mutation({
      query: ({ taskId, commentId, reply }) => ({
        url: "/reply-to-comment",
        method: "POST",
        body: { taskId, commentId, reply },
      }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useSpecificUserTasksQuery,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useAddTaskCommentMutation,
  useStartTaskTimeMutation,
  useEndTaskTimeMutation,
  useReplyToTaskCommentMutation, // <-- add this export
} = taskApi;
