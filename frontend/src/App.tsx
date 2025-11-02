

import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster } from "sonner";

// Auth Layout + Pages
import AuthLayout from "./pages/auth/auth-layout";
import Home from "./pages/root/home";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import VerifyEmail from "./pages/auth/verify-email";

// Dashboard Layout + Pages
import DashboardLayout from "./pages/dashboard/dashboard-layout";
import Dashboard from "./pages/dashboard";
import Workspaces from "./pages/dashboard/workspaces";
import WorkspaceDetails from "./pages/dashboard/workspaces/workspace-details";
import ProjectDetails from "./pages/dashboard/project/project-details";
import TaskDetails from "./pages/dashboard/task/task-details";
import MyTasks from "./pages/dashboard/my-tasks";
import Members from "./pages/dashboard/members";

// Others
import WorkspaceInvite from "./pages/dashboard/workspaces/workspace-invite";
import UserLayout from "./pages/user/user-layout";
import Profile from "./pages/user/profile";

function App() {
  return (
    <>
      <div className="min-h-svh flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>

            {/* AUTH ROUTES */}
            <Route path="/" element={<AuthLayout />}>
              <Route index element={<Home />} />
              <Route path="sign-in" element={<SignIn />} />
              <Route path="sign-up" element={<SignUp />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="verify-email" element={<VerifyEmail />} />
            </Route>

            {/* DASHBOARD ROUTES */}
            <Route path="/" element={<DashboardLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="workspaces" element={<Workspaces />} />
              <Route path="workspaces/:workspaceId" element={<WorkspaceDetails />} />
              <Route
                path="workspaces/:workspaceId/projects/:projectId"
                element={<ProjectDetails />}
              />
              <Route
                path="workspaces/:workspaceId/projects/:projectId/tasks/:taskId"
                element={<TaskDetails />}
              />
              <Route path="my-tasks" element={<MyTasks />} />
              <Route path="members" element={<Members />} />
            </Route>

            {/* STANDALONE ROUTE */}
            <Route
              path="workspace-invite/:workspaceId"
              element={<WorkspaceInvite />}
            />

            {/* USER ROUTES */}
            <Route path="/" element={<UserLayout />}>
              <Route path="user/profile" element={<Profile />} />
            </Route>

            {/* NOT FOUND */}
            <Route path="*" element={<h2 className="text-center mt-10">404 - Page Not Found</h2>} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </>
  );
}

export default App;

