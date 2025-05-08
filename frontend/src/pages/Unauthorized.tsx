import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const goBack = () => {
    const redirectPath = user?.role === "ADMIN" ? "/dashboard" : "/register-sale";
    navigate(redirectPath);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta página. Por favor, entre em contato com o administrador se acredita que isso é um erro.
        </p>
        
        <Button onClick={goBack} className="w-full bg-primary-purple hover:bg-tertiary-purple">
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
