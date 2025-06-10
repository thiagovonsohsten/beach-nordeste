import React, { useState, useMemo } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { saleService } from "@/lib/saleService";
import { productService } from "@/lib/productService";
import Header from "../components/Header";

const COLORS = ["#9b87f5", "#7E69AB", "#6E59A5", "#FEC6A1", "#FEF7CD"];

function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));
  for (const row of data) {
    csvRows.push(headers.map(field => JSON.stringify(row[field] ?? '')).join(','));
  }
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const Reports: React.FC = () => {
  const [period, setPeriod] = useState("mensal");
  const [activeTab, setActiveTab] = useState("category");
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: saleService.getSales
  });
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts
  });

  // Agrupamento por período
  const filterSalesByPeriod = (sales) => {
    const now = new Date();
    if (period === "diario") {
      return sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.toDateString() === now.toDateString();
      });
    } else if (period === "mensal") {
      return sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      });
    } else if (period === "anual") {
      return sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.getFullYear() === now.getFullYear();
      });
    }
    return sales;
  };

  const filteredSales = useMemo(() => filterSalesByPeriod(sales), [sales, period]);

  // Vendas por categoria
  const categoryData = useMemo(() => {
    const map = new Map();
    filteredSales.forEach(sale => {
      const category = sale.product?.category || "Outro";
      const value = (sale.product?.salePrice || 0) * sale.quantity;
      map.set(category, (map.get(category) || 0) + value);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  // Vendas por forma de pagamento
  const paymentMethodData = useMemo(() => {
    const map = new Map();
    filteredSales.forEach(sale => {
      const method = sale.paymentMethod || "Outro";
      const value = (sale.product?.salePrice || 0) * sale.quantity;
      map.set(method, (map.get(method) || 0) + value);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  // Desempenho dos vendedores
  const sellerData = useMemo(() => {
    const map = new Map();
    filteredSales.forEach(sale => {
      const name = sale.user?.name || "Outro";
      const revenue = (sale.product?.salePrice || 0) * sale.quantity;
      if (!map.has(name)) {
        map.set(name, { name, sales: 0, revenue: 0 });
      }
      const obj = map.get(name);
      obj.sales += sale.quantity;
      obj.revenue += revenue;
      map.set(name, obj);
    });
    return Array.from(map.values());
  }, [filteredSales]);

  return (
    <Layout title="Relatórios" requiredRole="ADMIN" showFilters={false}>
      <Header
        title="Relatórios"
        showFilters={true}
        onExport={() => {
          if (activeTab === 'category') exportToCSV(categoryData, 'relatorio_categoria.csv');
          else if (activeTab === 'payment') exportToCSV(paymentMethodData, 'relatorio_pagamento.csv');
          else if (activeTab === 'seller') exportToCSV(sellerData, 'relatorio_vendedores.csv');
        }}
      />
      <div className="flex justify-end mb-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diario">Diário</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="category">
        <div className="mb-6">
          <TabsList className="w-full max-w-md mx-auto">
            <TabsTrigger value="category" className="flex-1">Categoria</TabsTrigger>
            <TabsTrigger value="payment" className="flex-1">Pagamento</TabsTrigger>
            <TabsTrigger value="seller" className="flex-1">Vendedores</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Categoria de Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${value}`, "Receita"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${value}`, "Receita"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seller">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Vendedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sellerData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#9b87f5" />
                    <YAxis yAxisId="right" orientation="right" stroke="#FEC6A1" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales" name="Número de Vendas" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue" name="Receita (R$)" fill="#FEC6A1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Reports;
