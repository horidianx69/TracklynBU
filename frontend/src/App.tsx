import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { LoginForm } from "./pages/LoginForm";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import { SignupForm } from "./pages/SignupForm";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { useRoleRedirect } from "./hooks/useRoleRedirect";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
function App() {
  // ✅ This hook will now handle the redirection globally
  useRoleRedirect();
  return (
    <>
      <div className="min-h-svh flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboardPage />}/>
              <Route path="/student-dashboard" element={<StudentDashboardPage />}/>
            </Route>
          </Routes>
        </main>
        <Toaster />
      </div>
    </>
  );
}

export default App;
