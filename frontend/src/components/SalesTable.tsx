import React from "react";
import { useQuery } from "@tanstack/react-query";
import { saleService } from "@/lib/saleService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SalesTableProps {
  title?: string;
  limit?: number;
  showMySales?: boolean;
}

const SalesTable: React.FC<SalesTableProps> = ({
  title = "Vendas Recentes",
  limit = 5,
  showMySales = false,
}) => {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales', showMySales],
    queryFn: showMySales ? saleService.getMySales : saleService.getSales
  });

  const limitedSales = sales.slice(0, limit);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-500 mt-2">Nenhuma venda encontrada.</p>
      </div>
    );
  }

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Pix':
        return 'text-green-600';
      case 'Dinheiro':
        return 'text-blue-600';
      case 'Débito':
        return 'text-purple-600';
      case 'Crédito':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-100">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">Produto</TableHead>
              <TableHead className="hidden md:table-cell text-center">Quantidade</TableHead>
              <TableHead className="hidden md:table-cell">Valor</TableHead>
              <TableHead className="hidden md:table-cell">Vendedor</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="hidden md:table-cell">Forma de Pagamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {limitedSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium md:table-cell">
                  <div className="md:hidden">
                    <div className="font-medium">{sale.product?.name || 'Produto não encontrado'}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(sale.saleDate)}
                    </div>
                    <div className="text-sm mt-1">
                      {formatValue(sale.product?.salePrice ? sale.product.salePrice * sale.quantity : 0)}
                    </div>
                    <div className="text-sm mt-1">
                      {sale.user?.name || 'Vendedor não encontrado'}
                    </div>
                    <div className={`text-sm mt-1 ${getPaymentMethodColor(sale.paymentMethod)}`}>
                      {sale.paymentMethod || 'Não especificado'}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    {sale.product?.name || 'Produto não encontrado'}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-center">{sale.quantity || 0}</TableCell>
                <TableCell className="hidden md:table-cell">{formatValue(sale.product?.salePrice ? sale.product.salePrice * sale.quantity : 0)}</TableCell>
                <TableCell className="hidden md:table-cell">{sale.user?.name || 'Vendedor não encontrado'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm text-gray-500">
                    {formatDate(sale.saleDate)}
                  </div>
                </TableCell>
                <TableCell className={`hidden md:table-cell ${getPaymentMethodColor(sale.paymentMethod)}`}>
                  {sale.paymentMethod || 'Não especificado'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesTable;
