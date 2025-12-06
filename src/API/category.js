import { apiSlice } from "../apiService";

// Extend the API with category endpoints
export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories with pagination
    getCategories: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/category?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    // Get single category by ID
    getCategoryById: builder.query({
      query: (id) => ({
        url: `/category/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    // Create new category
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    // Update category
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        "Category",
      ],
    }),

    // Delete category
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
