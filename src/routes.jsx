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
import Leave from "./components/Leave/Leave";
import Reports from "./components/Report/Report";
import Register from "./components/RegisterForm/Register";
import CustomMessage from "./components/CustomMessage/CustomMessage";
import AllUsers from "./components/Users/AllUsers";
import ParticularUserProfile from "./components/Profile/ParticularUserProfile";
import ForgotPassword from "./components/Auth/ForgotPassword";
import TaskList from "./components/Task/TaskList";
import ViewUserTask from "./components/Task/ViewUserTask";
import Organization from "./components/SuperAdmin/Organization";
import FeatureProtectedRoute from "./utils/FeatureProtectedRoute";
import EditProfile from "./components/Profile/EditProfile";
import ViewProfile from "./components/Profile/ViewProfile";
import Notification from "./components/Notification/Notification"; // Import the new component
import OrgUserList from "./components/SuperAdmin/OrgUserList"; // <-- Add this import
import WorkFromHome from "./components/WorkFromHome/WorkFromHome"; // <-- Add this import
import DocumentForm from "./components/Upload Documents/DocumentForm"; // <-- Import the new component
import DocumentList from "./components/Upload Documents/DcoumentList"; // <-- Import the DocumentList
import AssetList from "./components/Assets/AssetList"; // <-- Import at the top
import AssignAssetList from "./components/Assets/AssignAssetList"; // <-- Add this import
import { AuthImageProvider } from "./components/Auth/AuthImageProvider";

const AppRoutes = () => {
  return (
    <AuthImageProvider>
    <Routes>
      <Route element={<ProtectedRoute authenticationRequired={false} />}>
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<ProtectedRoute authenticationRequired={true} />}>
        <Route element={<Layout />}>
          {/* Routes accessible only to super-admin */}
          <Route element={<RoleProtectedRoute allowedRoles={['super-admin']} />}>
            <Route path="/organization" element={<Organization />} />
            <Route path="/org-user-list" element={<OrgUserList />} />
          </Route>

          {/* Add feature protection for non-super-admin routes */}
          <Route element={<SuperAdminBlockedRoute blockedRoles={['super-admin']} />}>
            {/* Admin & User can access user-list */}
            <Route element={<RoleProtectedRoute allowedRoles={['admin', 'user']} />}>
              <Route path="/user-list" element={<AllUsers />} />
            </Route>

            {/* Admin-only routes */}
            <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/register" element={<Register />} />
              <Route path="/message" element={<CustomMessage />} />
              <Route path="/task-list" element={<TaskList />} />
              <Route path="/edit-profile/:id" element={<EditProfile />} />
              <Route path="/view-profile/:id" element={<ViewProfile />} />
            </Route>

            {/* User & Admin feature routes */}
            <Route element={<FeatureProtectedRoute />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leave" element={<Leave />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/view-task" element={<ViewUserTask />} />
              <Route path="/edit-profile/:id" element={<EditProfile />} />
              <Route path="/view-profile/:id" element={<ViewProfile />} />
              <Route path="/notifications" element={<Notification />} />
              <Route path="/work-from-home" element={<WorkFromHome />} />
              <Route path="/upload-documents" element={<DocumentList />} /> {/* <-- Use DocumentList here */}
              <Route path="/assets" element={<AssetList />} /> {/* <-- Add AssetList route */}
              <Route path="/assign-assets" element={<AssignAssetList />} /> {/* <-- Add this line */}
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
