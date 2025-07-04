import React from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <img src="/logo.png" alt="Logo Beach Nordeste" className="h-8 w-auto" />
              <span className="font-bold">Beach Nordeste</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Olá, {user?.name}
                </span>
                <Button variant="ghost" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 container py-6">
          {children}
        </main>
      </div>
    </div>
  );
} 