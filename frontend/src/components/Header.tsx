import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

interface HeaderProps {
  title: string;
  showFilters?: boolean;
  onExport?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showFilters = false, onExport }) => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="bg-white border-b border-gray-100 py-4 px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        
        {showFilters && isAdmin && (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select defaultValue="monthly">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="gap-1" onClick={onExport}>
              <Download size={16} />
              <span>Exportar</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
