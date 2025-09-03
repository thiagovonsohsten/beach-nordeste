import React from "react";
import Layout from "../components/Layout";
import SalesTable from "../components/SalesTable";

const Sales: React.FC = () => {
  return (
    <Layout title="Histórico de Vendas" requiredRole="ADMIN">
      <SalesTable 
        title="Todas as Vendas" 
        showAll={true} 
        itemsPerPage={25}
      />
    </Layout>
  );
};

export default Sales;
