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

  // Função para calcular tendência
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 100, isPositive: true };
    const percentage = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(percentage)),
      isPositive: percentage >= 0
    };
  };

  // Calcular totais do mês atual
  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() && 
           saleDate.getFullYear() === now.getFullYear();
  });

  const currentMonthRevenue = currentMonthSales.reduce((acc, sale) => {
    return acc + ((sale.product?.salePrice || 0) * sale.quantity);
  }, 0);

  const currentMonthSold = currentMonthSales.reduce((acc, sale) => acc + sale.quantity, 0);

  const currentMonthProfit = currentMonthSales.reduce((acc, sale) => {
    const salePrice = sale.product?.salePrice || 0;
    const purchasePrice = sale.product?.purchasePrice || 0;
    return acc + (salePrice - purchasePrice) * sale.quantity;
  }, 0);

  // Calcular totais do mês anterior
  const lastMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return saleDate.getMonth() === lastMonth.getMonth() && 
           saleDate.getFullYear() === lastMonth.getFullYear();
  });

  const lastMonthRevenue = lastMonthSales.reduce((acc, sale) => {
    return acc + ((sale.product?.salePrice || 0) * sale.quantity);
  }, 0);

  const lastMonthSold = lastMonthSales.reduce((acc, sale) => acc + sale.quantity, 0);

  const lastMonthProfit = lastMonthSales.reduce((acc, sale) => {
    const salePrice = sale.product?.salePrice || 0;
    const purchasePrice = sale.product?.purchasePrice || 0;
    return acc + (salePrice - purchasePrice) * sale.quantity;
  }, 0);

  // Calcular tendências
  const revenueTrend = calculateTrend(currentMonthRevenue, lastMonthRevenue);
  const soldTrend = calculateTrend(currentMonthSold, lastMonthSold);
  const profitTrend = calculateTrend(currentMonthProfit, lastMonthProfit);

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
          value={`R$ ${currentMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} className="text-primary-purple" />}
          trend={revenueTrend}
          bgColor="bg-soft-purple"
        />
        <DashboardCard
          title="Produtos Vendidos"
          value={currentMonthSold}
          icon={<ShoppingCart size={24} className="text-primary-purple" />}
          trend={soldTrend}
          bgColor="bg-soft-pink"
        />
        <DashboardCard
          title="Lucro"
          value={`R$ ${currentMonthProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={24} className="text-primary-purple" />}
          trend={profitTrend}
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
