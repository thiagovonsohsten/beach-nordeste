import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { Sidebar, SidebarProvider } from './components/ui/sidebar';

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import RegisterSale from "./pages/RegisterSale";
import MySalesPage from "./pages/MySalesPage";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Componente para redirecionamento condicional
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Se estiver carregando, não faz nada
  if (loading) {
    return null;
  }

  // Se o usuário estiver autenticado, redireciona para o dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Se não estiver autenticado, mostra a página pública
  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <DashboardLayout>
                    <Inventory />
                  </DashboardLayout>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <DashboardLayout>
                    <Sales />
                  </DashboardLayout>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
          
          {/* Funcionario Routes */}
          <Route
            path="/register-sale"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <DashboardLayout>
                    <RegisterSale />
                  </DashboardLayout>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-sales"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <DashboardLayout>
                    <MySalesPage />
                  </DashboardLayout>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
        
          {/* Error Pages */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;
