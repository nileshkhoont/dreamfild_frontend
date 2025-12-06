import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { useNavigate } from "react-router-dom";

const logoutUser = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("refreshToken");
  localStorage.setItem("isAuthenticated", "false");
  localStorage.removeItem("user");

  // disconnectSocket();

  window.location.href = "/";
};

const getFilenameFromHeaders = (headers) => {
  const contentDisposition = headers?.get("content-disposition");
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    return match?.[1] || "report.xlsx";
  }
  return "report.xlsx";
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  // credentials: "include",
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  try {
    let result = await baseQuery(args, api, extraOptions);

    // Determine the endpoint being called
    let endpoint = "";
    if (typeof args === "string") {
      endpoint = args;
    } else if (typeof args === "object" && args?.url) {
      endpoint = args.url;
    }
    endpoint = endpoint.toLowerCase();

    // Only logout on authentication errors
    if (
      (
        result?.error?.status === 403 ||
        result?.error?.data?.status === "account_disabled" ||
        result?.error?.data?.responseMessage === "Account disabled") &&
      !endpoint.includes("/login")
    ) {
      logoutUser();
      return {
        error: {
          status: result?.error?.status || 403,
          data: { message: "Authentication error. You have been logged out." },
        },
      };
    }

    if (
      result?.error?.status === 404 &&
      result?.error?.data?.responseMessage ===
      "User not found. Please remove the old token and try again."
    ) {
      const refreshToken = localStorage.getItem("refreshToken");
      const currentToken = localStorage.getItem("jwt");

      if (!refreshToken) {
        logoutUser();
        return result;
      }

      const refreshResult = await baseQuery(
        {
          url: "/refreshToken",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            refreshToken,
            token: currentToken,
          },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { token, refreshToken, user } = refreshResult.data;
        if (!token || !refreshToken) {
          logoutUser();
          return result;
        }
        localStorage.setItem("jwt", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("isAuthenticated", "true");
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          // No role-based logout here!
        }
        // Retry the original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        logoutUser();
      }
    }

    return result;
  } catch (error) {
    // Only logout on authentication errors
    if (error?.status === 403) {
      logoutUser();
    }
    return {
      error: {
        status: error?.status || 500,
        data: { message: "Request failed" },
      },
    };
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userData) => ({
        url: "/auth/login",
        method: "POST",
        body: userData,
      }),
      transformResponse: (response) => {
        // New API: { statusCode, data: { userData }, message }
        if (response?.statusCode === 200 && response?.data?.userData?.token) {
          const { token, ...userData } = response.data.userData;
          localStorage.setItem("jwt", token);
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("user", JSON.stringify(userData));
        }
        return response;
      },
    }),
    getDealers: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/dealer?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Dealers"],
    }),

    getSocialMedia: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/social-media?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["SocialMedia"],
    }),

    addSocialMedia: builder.mutation({
      query: (data) => ({
        url: "/social-media",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SocialMedia"],
    }),

    updateSocialMedia: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/social-media/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SocialMedia"],
    }),

    deleteSocialMedia: builder.mutation({
      query: (id) => ({
        url: `/social-media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SocialMedia"],
    }),

    updateSocialMediaStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/social-media/status/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["SocialMedia"],
    }),

    getTallyOrders: builder.query({
      query: ({ page = 1, limit = 10, event = "fetch_sales" }) => ({
        url: `/tally/fetch-master-data?event=${event}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["TallyOrders"],
    }),

    getBanks: builder.query({
      query: () => ({
        url: "/banks",
        method: "GET",
      }),
      providesTags: ["Banks"],
    }),

    addBank: builder.mutation({
      query: (data) => ({
        url: "/banks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Banks"],
    }),

    updateBank: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/banks/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Banks"],
    }),

    deleteBank: builder.mutation({
      query: (id) => ({
        url: `/banks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banks"],
    }),


    getAttendance: builder.mutation({
      query: (body) => ({
        url: "/attendance/summary",
        method: "POST",
        body: body || {},
        invalidatesTags: ["Attendance"],
      }),
    }),

    getLeave: builder.mutation({
      query: (body) => ({
        url: "/leave/summary",
        method: "POST",
        body: body || {},
        invalidatesTags: ["Leave"],
      }),
    }),
    getDashboardInfo: builder.query({
      query: () => "/today/summary",
      providesTags: ["Dashboard"],
      keepUnusedDataFor: 0,
    }),
    updateLeaveStatus: builder.mutation({
      query: (data) => ({
        url: "/update/leave/status",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Dashboard", "PendingWorkFromHome", "PendingPunchoutRequests"], // Add all relevant tags
    }),

    // not using this
    signup: builder.mutation({
      query: (userData) => ({
        url: "/signup",
        method: "POST",
        body: userData,
      }),
    }),
    attendanceReport: builder.mutation({
      query: (data) => ({
        url: "/attendanceReport",
        method: "POST",
        body: data,
      }),
    }),
    downloadReport: builder.mutation({
      query: (data) => ({
        url: "/generateReport",
        method: "POST",
        body: data,
        responseHandler: async (response) => {
          if (
            response.headers.get("content-type")?.includes("application/json")
          ) {
            return response.json();
          }

          // For successful file responses, download directly without storing in Redux
          if (response.ok) {
            const blob = await response.blob();
            const filename =
              getFilenameFromHeaders(response.headers) || "report.xlsx";

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // Return a serializable object instead of the Blob
            return { success: true, filename };
          }

          return response.json();
        },
      }),
    }),

    registerDealer: builder.mutation({
      query: (userData) => ({
        url: "/dealer/register", // Ensure this matches your backend route
        method: "POST",
        body: userData, // Correctly pass the payload
      }),
      invalidatesTags: ["Dealers"], // Invalidate the Dealers tag to refresh the dealer list
    }),

    sendMessage: builder.mutation({
      query: (data) => ({
        url: "/customize-message",
        method: "POST",
        body: data,
      }),
    }),

    showMessage: builder.query({
      query: () => ({
        url: "/getCustomMessage",
        method: "GET",
      }),
    }),

    deleteUser: builder.mutation({
      query: (data) => ({
        url: `/delete/user`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    disableUser: builder.mutation({
      query: (data) => ({
        url: `/disable/user`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Add the punch status query here
    getPunchStatus: builder.query({
      query: () => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/punch-status`,
        method: "GET",
      }),
      providesTags: ["PunchStatus"],
    }),

    punchIn: builder.mutation({
      query: (data) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/punch-in`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PunchStatus", "Attendance"],
    }),

    punchOut: builder.mutation({
      query: (data) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/punch-out`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PunchStatus", "Attendance"],
    }),

    punchoutCorrection: builder.mutation({
      query: ({ attendanceId, requestedPunchOutTime, reason }) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/attendance/punchout-correction`,
        method: "POST",
        body: { attendanceId, requestedPunchOutTime, reason },
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Add this endpoint after the punchoutCorrection mutation

    submitPunchCorrection: builder.mutation({
      query: (data) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/attendance/submit-punch-correction`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: `/edit-profile`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    viewProfile: builder.mutation({
      query: (data) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/admin/view-profile`,
        method: "POST",
        body: data, // Pass userId in the body
      }),
    }),

    viewLoggedinUserProfile: builder.query({
      query: () => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        method: "GET",
      }),
      providesTags: ["UserProfile"],
      keepUnusedDataFor: 0,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),

    editLoggedinUserProfile: builder.mutation({
      query: (data) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/edit-profile`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["UserProfile"],
    }),

    applyLeave: builder.mutation({
      query: (leaveData) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/apply/leave`,
        method: "POST",
        body: leaveData,
      }),
      invalidatesTags: ["Leave"],
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/change-password`,
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password`,
        method: "POST",
        body: data,
      }),
    }),

    // Location settings APIs
    setLocation: builder.mutation({
      query: (data) => ({
        url: "/set-location",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["LocationSettings"],
    }),

    getLocation: builder.query({
      query: () => "/get-location",
      providesTags: ["LocationSettings"],
    }),

    // Add this endpoint for fetching user details by ID (admin)
    getUserDetailsById: builder.query({
      query: (userId) => ({
        url: `/user/${userId}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    toggleWorkFromHome: builder.mutation({
      query: (userIds) => ({
        url: "/toggle-work-from-home",
        method: "POST",
        body: { userIds },
      }),
      invalidatesTags: ["User"],
    }),

    applyWorkFromHome: builder.mutation({
      query: (data) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/apply-work-from-home`,
        method: "POST",
        body: data,
      }),
    }),

    pendingWorkFromHome: builder.query({
      query: (organizationId) => ({
        url: "/pending-work-from-home",
        method: "POST",
        body: { organizationId },
      }),
      providesTags: ["PendingWorkFromHome"],
    }),

    updateWorkFromHomeStatus: builder.mutation({
      query: ({ wfhId, status, reason }) => ({
        url: "/update-work-from-home-status",
        method: "POST",
        body: { wfhId, status, reason },
      }),
      invalidatesTags: ["PendingWorkFromHome", "Dashboard"], // Add all relevant tags
    }),

    getWorkFromHomeList: builder.query({
      query: ({ organizationId, userId }) => {
        let url = `/work-from-home-list/${organizationId}`;
        if (userId) {
          url += `?userId=${userId}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["WorkFromHomeList"],
    }),

    deleteUserDocument: builder.mutation({
      query: ({ userId, docUrl, type }) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/user/delete-document`,
        method: "POST",
        body: { userId, docUrl, type },
      }),
      invalidatesTags: ["UserProfile"],
    }),

    getPendingPunchoutRequests: builder.query({
      query: () => ({
        url: "/attendance/pending-punchout-requests",
        method: "GET",
      }),
      providesTags: ["PendingPunchoutRequests"],
    }),

    updatePunchCorrectionStatus: builder.mutation({
      query: ({ requestId, status, adminComment }) => ({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/admin/attendance/punch-correction/status`,
        method: "POST",
        body: { requestId, status, adminComment },
      }),
      invalidatesTags: ["PendingPunchoutRequests", "Dashboard"],
    }),

    uploadDocument: builder.mutation({
      query: ({ userId, documentName, document }) => {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("documentName", documentName);
        formData.append("document", document); // single

        return {
          url: "/upload-document",
          method: "POST",
          body: formData,
        };
      },
    }),

    getAllDocuments: builder.query({
      query: (orgId) => ({
        url: `/get-all-documents/${orgId}`,
        method: "GET",
      }),
    }),

    deleteDocument: builder.mutation({
      query: ({ documentId }) => ({
        url: "/delete-document",
        method: "DELETE",
        body: { documentId },
      }),
    }),

    updateDealerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/dealer/status/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Dealers"],
    }),
    addDealerUser: builder.mutation({
      query: (userData) => ({
        url: "/dealer/add-user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Dealers"],
    }),

    // --- MEDIA MODULE START ---
    getMedia: builder.query({
      query: ({ page = 1, limit = 10, type = "Media" } = {}) => ({
        url: `/media?page=${page}&limit=${limit}&type=${encodeURIComponent(
          type
        )}`,
        method: "GET",
      }),
      providesTags: ["Media"],
    }),
    updateMediaStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/media/status/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Media"],
    }),
    uploadMedia: builder.mutation({
      query: ({ formData, type = "Media" }) => {
        // Append type to formData instead of query param
        formData.append("type", type);
        return {
          url: `/media/upload`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Media"],
    }),
    // --- MEDIA MODULE END ---

    getTallyProducts: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/tally-products?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["TallyProducts"],
    }),
    getTallyProductByName: builder.query({
      query: (productName) => ({
        url: `/tally-products/get-by-product-name?productName=${encodeURIComponent(productName)}`,
        method: "GET",
      }),
      providesTags: ["TallyProducts"],
    }),
    updateTallyProduct: builder.mutation({
      query: (formData) => ({
        url: `/tally-products/${formData.get('id')}`,
        method: "PUT",
        body: formData,
        // Remove the headers - let the browser set them automatically for FormData
      }),
      invalidatesTags: ["TallyProducts"],
    }),

    syncTallyProducts: builder.mutation({
      query: () => ({
        url: "/tally-products/sync",
        method: "POST",
      }),
      invalidatesTags: ["TallyProducts"],
    }),

    syncTallyData: builder.mutation({
      query: (eventArray) => ({
        url: "/tally",
        method: "POST",
        body: { event: eventArray },
      }),
    }),

    // Add these new endpoints in the endpoints section
    getTallyLedgers: builder.query({
      query: ({ event = "fetch_ledgers" }) => ({
        url: `/tally/fetch-master-data?event=${event}`,
        method: "GET",
      }),
      providesTags: ["TallyLedgers"],
    }),

    createPartyLedgerMapping: builder.mutation({
      query: (data) => ({
        url: "/mapping-master/party-ledger",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Dealers"],
    }),

    // Orders API
    getOrders: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/orders?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetDealersQuery,
  useGetSocialMediaQuery,
  useAddSocialMediaMutation,
  useUpdateSocialMediaMutation,
  useDeleteSocialMediaMutation,
  useUpdateSocialMediaStatusMutation,
  useGetTallyOrdersQuery,
  useGetBanksQuery,
  useAddBankMutation,
  useUpdateBankMutation,
  useDeleteBankMutation,

  useGetAttendanceMutation,
  useGetLeaveMutation,
  useGetDashboardInfoQuery,
  useUpdateLeaveStatusMutation,
  useDownloadReportMutation,
  useAttendanceReportMutation,
  useSignupMutation,

  useRegisterUserMutation,
  useSendMessageMutation,
  useRegisterDealerMutation,
  useUpdateDealerStatusMutation,
  useAddDealerUserMutation,
  useShowMessageQuery,
  useDeleteUserMutation,
  useDisableUserMutation,

  useGetPunchStatusQuery,
  usePunchInMutation,
  usePunchOutMutation,

  useUpdateProfileMutation,
  useViewProfileMutation,

  useViewLoggedinUserProfileQuery,
  // useChangePasswordMutation,
  useEditLoggedinUserProfileMutation,

  useApplyLeaveMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,

  useSetLocationMutation,
  useGetLocationQuery,

  useGetUserDetailsByIdQuery,
  useToggleWorkFromHomeMutation,
  useApplyWorkFromHomeMutation,
  usePendingWorkFromHomeQuery,
  useUpdateWorkFromHomeStatusMutation,

  useGetWorkFromHomeListQuery,
  useDeleteUserDocumentMutation,
  usePunchoutCorrectionMutation,
  useSubmitPunchCorrectionMutation,
  useGetPendingPunchoutRequestsQuery,
  useUpdatePunchCorrectionStatusMutation,
  useUploadDocumentMutation,
  useGetAllDocumentsQuery,
  useDeleteDocumentMutation,

  useGetMediaQuery,
  useUpdateMediaStatusMutation,
  useUploadMediaMutation,

  useGetTallyProductsQuery,
  useGetTallyProductByNameQuery,
  useUpdateTallyProductMutation,
  useSyncTallyProductsMutation,
  useSyncTallyDataMutation,

  // Add these missing exports
  useGetTallyLedgersQuery,
  useCreatePartyLedgerMappingMutation,
  
  useGetOrdersQuery,
} = apiSlice;
