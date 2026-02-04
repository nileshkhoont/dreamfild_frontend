import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const assetsBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/asset`, 
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
}); 

export const assetsApi = createApi({
  reducerPath: "assetsApi",
  baseQuery: assetsBaseQuery,
  tagTypes: ["Asset"],
  endpoints: (builder) => ({
    createAsset: builder.mutation({
      query: (formData) => ({
        url: "/create/asset",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Asset"],
    }),
    getAssets: builder.query({
      query: () => ({
        url: "/get/assets",
        method: "GET",
      }),
      providesTags: ["Asset"],
    }),
    assignAsset: builder.mutation({
      query: (formData) => ({
        url: "/assigned/assets", 
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Asset"],
    }),
    getAssignedAssets: builder.query({
      query: () => ({
        url: "/assigned/assets",
        method: "GET",
      }),
      providesTags: ["Asset"],
    }),
    updateAsset: builder.mutation({
      query: (formData) => ({
        url: "/update/assign-asset",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Asset"],
    }),
    getAllAssignedUserAssets: builder.query({
      query: (userId) => ({
        url: userId
          ? `/get/all-assigned-user-assets/${userId}`
          : `/get/all-assigned-user-assets`,
        method: "GET",
      }),
      providesTags: ["Asset"],
    }),
    
    deleteAsset: builder.mutation({
      query: (assetId) => ({
        url: `/asset/${assetId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Asset"],
    }),

    deleteAssignedAsset: builder.mutation({
      query: ({ assetId, assignmentId }) => ({
        url: `/asset/${assetId}/assignment/${assignmentId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Asset"],
    }),
    returnAsset: builder.mutation({
      query: (formData) => ({
        url: "/return/asset",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Asset"],
    }),
  }),
}); 
 
export const {
  useCreateAssetMutation,
  useGetAssetsQuery,
  useUpdateAssetMutation,
  useAssignAssetMutation,
  useGetAssignedAssetsQuery,
  useGetAllAssignedUserAssetsQuery,
  useDeleteAssetMutation,
  useDeleteAssignedAssetMutation,
  useReturnAssetMutation,
} = assetsApi;
