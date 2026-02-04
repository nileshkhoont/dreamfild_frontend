import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import Home from "./components/Home";
import ProtectedRoute from "./utils/ProtectedRoute";
import RoleProtectedRoute from "./utils/RoleProtectedRoute";
import SuperAdminBlockedRoute from "./utils/SuperAdminBlockedRoute";
import Layout from "./components/Layout/Layout";
import Attendance from "./components/Attendance/Attendance";
import Reports from "./components/Report/Report";
import Register from "./components/RegisterForm/Register";
import ParticularUserProfile from "./components/Profile/ParticularUserProfile";
import ForgotPassword from "./components/Auth/ForgotPassword";
import FeatureProtectedRoute from "./utils/FeatureProtectedRoute";
import EditProfile from "./components/Profile/EditProfile";
import ViewProfile from "./components/Profile/ViewProfile";
import DocumentList from "./components/Upload Documents/DcoumentList"; // <-- Import the DocumentList
import { AuthImageProvider } from "./components/Auth/AuthImageProvider";
import Dealer from "./components/Dealer/Dealer";
import SocialMedia from "./components/SocialMedia/SocialMedia";
import TallyOrders from "./components/TallyOrders/TallyOrders";
import Bank from "./components/Bank/Bank";
import MediaList from "./components/Media/MediaList"; // <-- Add this import
import SchemeList from "./components/Scheme/SchemeList"; // <-- Add SchemeList import
import TallyProductList from "./components/TallyProduct/TallyProductList"; // <-- Add this import
import TallyProductVariants from "./components/TallyProduct/TallyProductVariants";
import Orders from "./components/TallyOrders/Orders"; // <-- Add Orders import
import Category from "./components/Category/Category"; // <-- Add Category import

const AppRoutes = () => {
  return (
    <AuthImageProvider>
    <Routes>
      <Route element={<ProtectedRoute authenticationRequired={false} />}>
        <Route path="/" element={<LoginForm />} />
        {/* <Route path="/signup" element={<SignupForm />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      </Route>
      <Route element={<ProtectedRoute authenticationRequired={true} />}>
        <Route element={<Layout />}>
          {/* Routes accessible only to super-admin */}
          <Route element={<RoleProtectedRoute allowedRoles={['super-admin']} />}>
          </Route>

          {/* Add feature protection for non-super-admin routes */}
          <Route element={<SuperAdminBlockedRoute blockedRoles={['super-admin']} />}>
            {/* Admin & User can access user-list */}
            <Route element={<RoleProtectedRoute allowedRoles={['admin', 'user']} />}>
            </Route>

            {/* Admin-only routes */}
            <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/register" element={<Register />} />
              <Route path="/edit-profile/:id" element={<EditProfile />} />
              <Route path="/view-profile/:id" element={<ViewProfile />} />
            </Route>

            {/* User & Admin feature routes */}
            <Route element={<FeatureProtectedRoute />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/edit-profile/:id" element={<EditProfile />} />
              <Route path="/view-profile/:id" element={<ViewProfile />} />
              <Route path="/upload-documents" element={<DocumentList />} /> {/* <-- Use DocumentList here */}
              <Route path="/dealers" element={<Dealer />} />
              <Route path="/social-media" element={<SocialMedia />} />
              <Route path="/tally-orders" element={<TallyOrders />} />
              <Route path="/banks" element={<Bank />} />
              <Route path="/category" element={<Category />} /> {/* <-- Add Category route */}
              <Route path="/media" element={<MediaList />} /> {/* <-- Add this line */}
              <Route path="/scheme" element={<SchemeList />} /> {/* <-- Add scheme route */}
              <Route path="/tally-products" element={<TallyProductList />} /> {/* <-- Add this line */}
              <Route path="/tally-products/:id" element={<TallyProductVariants />} /> {/* <-- Add this line */}
              <Route path="/orders" element={<Orders />} /> {/* <-- Add Orders route */}
            </Route>
          </Route>

          <Route path="/user-profile" element={<ParticularUserProfile />} />
        </Route>
      </Route>
    </Routes>
    </AuthImageProvider>
  );
};

export default AppRoutes;
