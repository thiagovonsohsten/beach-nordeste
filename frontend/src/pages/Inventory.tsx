import React from "react";
import Layout from "../components/Layout";
import ProductTable from "../components/ProductTable";

const Inventory: React.FC = () => {
  return (
    <Layout title="Gerenciamento de Estoque" requiredRole="ADMIN">
      <ProductTable />
    </Layout>
  );
};

export default Inventory;
