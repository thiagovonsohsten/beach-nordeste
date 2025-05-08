import React from "react";
import Layout from "../components/Layout";
import MySales from "../components/MySales";

const MySalesPage: React.FC = () => {
  return (
    <Layout title="Minhas Vendas" requiredRole="ANY">
      <MySales />
    </Layout>
  );
};

export default MySalesPage;
