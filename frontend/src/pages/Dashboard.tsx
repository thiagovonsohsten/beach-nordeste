import React from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardCard from "../components/DashboardCard";
import SalesChart from "../components/SalesChart";
import SalesTable from "../components/SalesTable";
import { ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { saleService } from "@/lib/saleService";
import { productService } from "@/lib/productService";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Buscar vendas e produtos
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: saleService.getSales
  });
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts
  });

  // Calcular totais
  const totalRevenue = sales.reduce((acc, sale) => {
    return acc + ((sale.product?.salePrice || 0) * sale.quantity);
  }, 0);

  const totalSold = sales.reduce((acc, sale) => acc + sale.quantity, 0);

  const totalProfit = sales.reduce((acc, sale) => {
    const salePrice = sale.product?.salePrice || 0;
    const purchasePrice = sale.product?.purchasePrice || 0;
    return acc + (salePrice - purchasePrice) * sale.quantity;
  }, 0);

  // Verifica se o usuário é admin
  if (user?.role !== 'ADMIN') {
    return null;
  }

  if (loadingSales || loadingProducts) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DashboardCard
          title="Receita Total"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} className="text-primary-purple" />}
          trend={{ value: 12, isPositive: true }}
          bgColor="bg-soft-purple"
        />
        <DashboardCard
          title="Produtos Vendidos"
          value={totalSold}
          icon={<ShoppingCart size={24} className="text-primary-purple" />}
          trend={{ value: 8, isPositive: true }}
          bgColor="bg-soft-pink"
        />
        <DashboardCard
          title="Lucro"
          value={`R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={24} className="text-primary-purple" />}
          trend={{ value: 5, isPositive: false }}
          bgColor="bg-soft-peach"
        />
      </div>
      <div className="mb-6">
        <SalesChart />
      </div>
      <div>
        <SalesTable />
      </div>
    </>
  );
};

export default Dashboard;
