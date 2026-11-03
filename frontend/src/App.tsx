import { useState } from "react";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { AuthProvider, useAuth } from "./modules/auth/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "./components/ui/Toast";
import { useToast } from "./hooks/useToast";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { HistoryPage } from "./pages/HistoryPage";
import { ClinicLoginPage } from "./pages/ClinicLoginPage";
import { ClinicDashboardPage } from "./pages/ClinicDashboardPage";
import { ClinicPatientSummaryPage } from "./pages/ClinicPatientSummaryPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout() {
  const { toasts, removeToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-[#f3f4fa] dark:bg-[#0f0f0f]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 w-full lg:w-auto">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="pt-16 p-4 lg:p-6 overflow-y-auto h-full">
          <Outlet />
        </main>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/clinic/login" element={<ClinicLoginPage />} />
      <Route path="/clinic/dashboard" element={<ClinicDashboardPage />} />
      <Route path="/clinic/patient/:id" element={<ClinicPatientSummaryPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="historico" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}