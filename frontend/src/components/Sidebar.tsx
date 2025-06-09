import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart, 
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Define navigation items based on user role
  const adminNavItems = [
    {
      name: "Início",
      path: "/",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Estoque",
      path: "/inventory",
      icon: <Package size={20} />,
    },
    {
      name: "Vendas",
      path: "/sales",
      icon: <ShoppingCart size={20} />,
    },
    {
      name: "Relatórios",
      path: "/reports",
      icon: <BarChart size={20} />,
    },
  ];

  const funcionarioNavItems = [
    {
      name: "Register Sale",
      path: "/register-sale",
      icon: <ShoppingCart size={20} />,
    },
    {
      name: "My Sales",
      path: "/my-sales",
      icon: <BarChart size={20} />,
    },
  ];

  const navItems = user?.role === "ADMIN" ? adminNavItems : funcionarioNavItems;

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        {!collapsed && (
          <span className="text-lg font-semibold text-primary-purple">
            Beach Nordeste
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden md:block"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="p-4 flex items-center border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-soft-purple flex items-center justify-center">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={20} className="text-primary-purple" />
          )}
        </div>
        {!collapsed && (
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl transition-colors",
                  location.pathname === item.path
                    ? "bg-soft-purple text-primary-purple font-medium"
                    : "text-gray-600 hover:bg-gray-50",
                  collapsed ? "justify-center" : ""
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-100 p-4">
        <button
          onClick={logout}
          className={cn(
            "flex items-center px-4 py-2 text-gray-600 hover:text-red-500 transition-colors w-full rounded-xl hover:bg-red-50",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 h-screen flex flex-col hidden md:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
