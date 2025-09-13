import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import { LoginForm } from "./pages/LoginForm";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import { SignupForm } from "./pages/SignupForm";
import { AuthProvider } from "./lib/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
