import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const organizationBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/super-admin/`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

export const organizationApi = createApi({
  reducerPath: "organizationApi",
  baseQuery: organizationBaseQuery,
  tagTypes: ["Organization", "Feature"], // Added "Feature" tag
  endpoints: (builder) => ({
    addOrganization: builder.mutation({
      query: (orgData) => ({
        url: "/add-organization",
        method: "POST",
        body: orgData,
      }),
      invalidatesTags: ["Organization"],
    }),
    getAllOrganizations: builder.query({
      query: () => ({
        url: "/get-all-organizations",
        method: "GET",
      }),
      providesTags: ["Organization"],
    }),
    editOrganization: builder.mutation({
      query: (orgData) => ({
        url: `/edit-organization`,
        method: "PATCH",
        body: orgData,
      }),
      invalidatesTags: ["Organization"],
    }),

    toggleOrganizationStatus: builder.mutation({
      query: ({ organizationId, isDisabled }) => ({
        url: "/activate-organization",
        method: "PATCH",
        body: { organizationId, isDisabled },
      }),
      invalidatesTags: ["Organization"],
    }),
    softDeleteOrganization: builder.mutation({
      query: ({ organizationId }) => ({
        url: "/soft-delete-organization",
        method: "PATCH",
        body: { organizationId },
      }),
      invalidatesTags: ["Organization"],
    }),

    getAllFeatures: builder.query({
      query: () => ({
        url: "/get-all-features", // Backend endpoint for fetching features
        method: "GET",
      }),
      providesTags: ["Feature"], // Provides "Feature" tag
    }),

    getOrganizationFeatures: builder.query({
      query: (organizationId) => ({
        url: `/organization/features`, // Updated endpoint
        method: "POST", // Changed to POST to match the backend
        body: { organizationId }, // Send organizationId in the request body
      }),
      providesTags: ["Feature"], // Provides "Feature" tag
    }),

    addFeature: builder.mutation({
      query: (featureData) => ({
        url: "/add-feature",
        method: "POST",
        body: featureData,
      }),
      invalidatesTags: ["Feature"],
    }),

    deleteFeature: builder.mutation({
      query: ({ featureId }) => ({
        url: "/delete-feature",
        method: "DELETE",
        body: { featureId },
      }),
      invalidatesTags: ["Feature", "Organization"],
    }),

    getUsersByOrganization: builder.mutation({
      query: (organizationId) => ({
        url: "/get-users-by-organization",
        method: "POST",
        body: { organizationId },
      }),
    }),
  }),
});

export const {
  useAddOrganizationMutation,
  useGetAllOrganizationsQuery,
  useEditOrganizationMutation,
  useToggleOrganizationStatusMutation,
  useSoftDeleteOrganizationMutation,
  useGetAllFeaturesQuery, // Export the new query hook

  useAddFeatureMutation,
  useDeleteFeatureMutation,
  useGetUsersByOrganizationMutation, // Export the new mutation hook
} = organizationApi;
