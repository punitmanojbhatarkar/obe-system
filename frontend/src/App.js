import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.css';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFaculty from './pages/admin/AdminFaculty';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminSettings from './pages/admin/AdminSettings';

// Main app
import SubjectSelect from './pages/SubjectSelect';
import SubjectLayout from './components/shared/SubjectLayout';
import VisionMissionPage from './pages/subject/VisionMissionPage';
import CourseOutcomesPage from './pages/subject/CourseOutcomesPage';
import PIMappingPage from './pages/subject/PIMappingPage';
import COPOMatrixPage from './pages/subject/COPOMatrixPage';
import ActivitiesPage from './pages/subject/ActivitiesPage';
import StudentsPage from './pages/subject/StudentsPage';
import MarksPage from './pages/subject/MarksPage';
import AttainmentPage from './pages/subject/AttainmentPage';
import ExitSurveyPage from './pages/subject/ExitSurveyPage';
import ActionReportPage from './pages/subject/ActionReportPage';
import ReportPage from './pages/subject/ReportPage';
import SuggestionsPage from './pages/subject/SuggestionsPage';

// Public
import SurveyFillPage from './pages/SurveyFillPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/survey/:token" element={<SurveyFillPage />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/faculty" element={<ProtectedRoute roles={['admin']}><AdminFaculty /></ProtectedRoute>} />
      <Route path="/admin/subjects" element={<ProtectedRoute roles={['admin']}><AdminSubjects /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />

      {/* Subject selection */}
      <Route path="/subjects" element={<ProtectedRoute roles={['champion','instructor']}><SubjectSelect /></ProtectedRoute>} />

      {/* Subject modules */}
      <Route path="/subject/:contextId" element={<ProtectedRoute roles={['champion','instructor']}><SubjectLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="vision" replace />} />
        <Route path="vision" element={<VisionMissionPage />} />
        <Route path="cos" element={<CourseOutcomesPage />} />
        <Route path="pi-mapping" element={<PIMappingPage />} />
        <Route path="copo-matrix" element={<COPOMatrixPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="marks" element={<MarksPage />} />
        <Route path="exit-survey" element={<ExitSurveyPage />} />
        <Route path="attainment" element={<AttainmentPage />} />
        <Route path="action-report" element={<ActionReportPage />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
        <Route path="report" element={<ReportPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={
        user?.role === 'admin' ? <Navigate to="/admin" /> :
        user ? <Navigate to="/subjects" /> :
        <Navigate to="/login" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: 13 } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
