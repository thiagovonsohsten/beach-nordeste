import React from "react";
import Layout from "../components/Layout";
import SalesTable from "../components/SalesTable";

// Gerar mais dados de exemplo para a página de vendas
const generateSalesData = () => {
  const products = [
    "Guarda-sol",
    "Protetor Solar FPS 50",
    "Cadeira de Praia",
    "Kit de Snorkel",
    "Toalha de Praia",
    "Boia Inflável",
    "Caixa Térmica",
    "Óculos de Natação",
    "Bola de Praia",
    "Capa Impermeável para Celular"
  ];
  
  const sellers = [
    "João Silva",
    "Maria Oliveira",
    "Carlos Santos",
    "Ana Costa",
    "Paulo Mendes"
  ];
  
  const paymentMethods = ["Pix", "Dinheiro", "Débito", "Crédito"];
  
  const sales = [];
  
  for (let i = 1; i <= 20; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];
    const randomPayment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const randomQuantity = Math.floor(Math.random() * 5) + 1;
    const randomValue = (Math.random() * 100 + 10).toFixed(2);
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
    
    sales.push({
      id: i.toString(),
      product: randomProduct,
      quantity: randomQuantity,
      value: parseFloat(randomValue),
      sellerName: randomSeller,
      date: randomDate,
      paymentMethod: randomPayment as "Pix" | "Dinheiro" | "Débito" | "Crédito"
    });
  }
  
  return sales;
};

const Sales: React.FC = () => {
  const salesData = generateSalesData();
  
  return (
    <Layout title="Histórico de Vendas" requiredRole="ADMIN" showFilters={true}>
      <SalesTable sales={salesData} title="Todas as Vendas" limit={20} />
    </Layout>
  );
};

export default Sales;
