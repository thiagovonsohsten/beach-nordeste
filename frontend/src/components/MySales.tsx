import React from "react";
import { useAuth } from "../contexts/AuthContext";
import SalesTable from "./SalesTable";

interface Sale {
  id: string;
  product: string;
  quantity: number;
  value: number;
  sellerName: string;
  date: Date;
  paymentMethod: "Pix" | "Dinheiro" | "Débito" | "Crédito";
}

// Dados de exemplo para o usuário atual
const userSales: Sale[] = [
  {
    id: "1",
    product: "Guarda-sol",
    quantity: 1,
    value: 59.99,
    sellerName: "Funcionário",
    date: new Date("2023-05-01"),
    paymentMethod: "Crédito",
  },
  {
    id: "2",
    product: "Protetor Solar FPS 50",
    quantity: 2,
    value: 29.98,
    sellerName: "Funcionário",
    date: new Date("2023-05-02"),
    paymentMethod: "Pix",
  },
  {
    id: "3",
    product: "Cadeira de Praia",
    quantity: 1,
    value: 45.00,
    sellerName: "Funcionário",
    date: new Date("2023-05-03"),
    paymentMethod: "Dinheiro",
  },
];

const MySales: React.FC = () => {
  // Em uma aplicação real, você buscaria as vendas do usuário de uma API
  return <SalesTable sales={userSales} title="Minhas Vendas" limit={10} />;
};

export default MySales;
