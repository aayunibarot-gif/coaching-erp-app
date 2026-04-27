import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Layout from "./components/Layout";
import Loader from "./components/Loader";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import ClassesPage from "./pages/ClassesPage";
import SubjectsPage from "./pages/SubjectsPage";
import TimetablePage from "./pages/TimetablePage";
import AttendancePage from "./pages/AttendancePage";
import MarksPage from "./pages/MarksPage";
import FeesPage from "./pages/FeesPage";
import NoticesPage from "./pages/NoticesPage";
import AssistantPage from "./pages/AssistantPage";
import StudentDetailsPage from "./pages/StudentDetailsPage";
import MaterialsPage from "./pages/MaterialsPage";
import ProfilePage from "./pages/ProfilePage";
import ResultPage from "./pages/ResultPage";


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="marks" element={<MarksPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="results" element={<ResultPage />} />
        <Route path="students/:id" element={<StudentDetailsPage />} />
      </Route>


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}