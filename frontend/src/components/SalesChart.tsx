import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { saleService } from "@/lib/saleService";

const SalesChart: React.FC = () => {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: saleService.getSales
  });

  // Função para agrupar vendas por mês
  const getMonthlySales = () => {
    const monthlyData = Array(12).fill(0).map((_, index) => ({
      name: new Date(0, index).toLocaleString('pt-BR', { month: 'short' }),
      sales: 0
    }));

    sales.forEach(sale => {
      const saleDate = new Date(sale.saleDate);
      const monthIndex = saleDate.getMonth();
      const saleValue = (sale.product?.salePrice || 0) * sale.quantity;
      monthlyData[monthIndex].sales += saleValue;
    });

    return monthlyData;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Vendas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <p>Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = getMonthlySales();

  return (
    <Card className="w-full">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-base md:text-lg text-gray-800">Vendas por Mês</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                fontSize={10}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip
                formatter={(value) => [`R$ ${value}`, "Vendas"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="sales"
                fill="#9b87f5"
                barSize={20}
                radius={[4, 4, 0, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
