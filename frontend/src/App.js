import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { Toaster } from "./components/ui/toaster";
import Navbar from "./components/Navbar";
import "./i18n/config"; // Import i18n configuration
import Home from "./pages/Home";
import CoursesPage from "./pages/CoursesPage";
import CourseDetail from "./pages/CourseDetail";
import CoursePlayer from "./pages/CoursePlayer";
import MyLearning from "./pages/MyLearning";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Layout wrapper with Navbar
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppSettingsProvider>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Routes with Navbar */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/courses" element={<Layout><CoursesPage /></Layout>} />
              <Route path="/courses/:id" element={<Layout><CourseDetail /></Layout>} />
              
              {/* Protected Routes */}
              <Route 
                path="/my-learning" 
                element={
                  <ProtectedRoute>
                    <Layout><MyLearning /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learn/:id" 
                element={
                  <ProtectedRoute>
                    <Layout><CoursePlayer /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/instructor" 
                element={
                  <ProtectedRoute>
                    <Layout><InstructorDashboard /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Layout><AdminDashboard /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster />
          </div>
        </AppSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
