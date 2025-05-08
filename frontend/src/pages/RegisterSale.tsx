import React from "react";
import Layout from "../components/Layout";
import SaleForm from "../components/SaleForm";

const RegisterSale: React.FC = () => {
  return (
    <Layout title="Registrar Venda" requiredRole="ANY">
      <div className="max-w-xl mx-auto">
        <SaleForm />
      </div>
    </Layout>
  );
};

export default RegisterSale;
