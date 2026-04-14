import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster } from "sonner";
import { Loader } from "./components/loader";

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
import FacultyRequests from "./pages/dashboard/admin/faculty-requests";
import { useAuth } from "./provider/auth-context";

// 1. Create a layout component that includes the Navbar
const MainLayout = () => (
  <div className="min-h-svh flex flex-col">
    <Navbar />
    <main className="flex-grow flex flex-col">
      <Outlet />
    </main>
  </div>
);

// Role-based route protection component
const RoleGate = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/sign-in" />;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      <Toaster /> 
      
      <Routes>
        {/* --- GROUP 1: LANDING PAGE --- */}
        <Route path="/" element={<Home />} />

        {/* --- GROUP 2: PAGES WITH APP NAVBAR --- */}
        <Route element={<MainLayout />}>
          <Route element={<AuthLayout />}>
            <Route path="sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<VerifyEmail />} />
          </Route>

          <Route element={<UserLayout />}>
            <Route path="user/profile" element={<Profile />} />
          </Route>
          
          <Route path="workspace-invite/:workspaceId" element={<WorkspaceInvite />} />
          <Route path="*" element={<h2 className="text-center mt-10">404 - Page Not Found</h2>} />
        </Route>

        {/* --- GROUP 3: DASHBOARD --- */}
        <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workspaces" element={<Workspaces />} />
            <Route path="workspaces/:workspaceId" element={<WorkspaceDetails />} />
            <Route path="workspaces/:workspaceId/projects/:projectId" element={<ProjectDetails />} />
            <Route path="workspaces/:workspaceId/projects/:projectId/tasks/:taskId" element={<TaskDetails />} />
            
            {/* Protected Routes */}
            <Route path="my-tasks" element={<MyTasks />} />
            
            <Route path="members" element={
              <RoleGate allowedRoles={["admin", "faculty"]}>
                <Members />
              </RoleGate>
            } />

            <Route path="admin/faculty-requests" element={
              <RoleGate allowedRoles={["admin"]}>
                <FacultyRequests />
              </RoleGate>
            } />
        </Route>

      </Routes>
    </>
  );
}

export default App;