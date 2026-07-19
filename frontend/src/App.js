import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Search from "./pages/Search";
import BusinessDetail from "./pages/BusinessDetail";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ContactAdmin from "./pages/ContactAdmin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Suppress AbortError in development
if (typeof window !== "undefined") {
  const originalError = console.error;

  console.error = (...args) => {
    const message = args[0]?.toString?.() || "";

    if (
      message.includes("AbortError") ||
      message.includes("aborted") ||
      message.includes("body stream already read") ||
      message.includes("signal is aborted")
    ) {
      return;
    }

    originalError.apply(console, args);
  };

  window.addEventListener("unhandledrejection", (event) => {
    const message =
      event.reason?.message || event.reason?.toString?.() || "";

    if (
      message.includes("AbortError") ||
      message.includes("aborted") ||
      message.includes("body stream already read") ||
      message.includes("signal is aborted")
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener(
    "error",
    (event) => {
      const message = event.message || "";

      if (
        message.includes("AbortError") ||
        message.includes("aborted") ||
        message.includes("body stream already read") ||
        message.includes("signal is aborted")
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    },
    true
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/signup" element={<Layout><Signup /></Layout>} />
            <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
            <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
            <Route path="/search" element={<Layout><Search /></Layout>} />
            <Route path="/business/:id" element={<Layout><BusinessDetail /></Layout>} />
            <Route path="/contact-admin" element={<Layout><ContactAdmin /></Layout>} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout><UserDashboard /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/owner"
              element={
                <ProtectedRoute requiredRole="owner">
                  <Layout><OwnerDashboard /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
