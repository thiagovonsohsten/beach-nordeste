import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SalesTableProps {
  title?: string;
  limit?: number;
  showMySales?: boolean;
  showAll?: boolean;
  itemsPerPage?: number;
}

const SalesTable: React.FC<SalesTableProps> = ({
  title = "Vendas Recentes",
  limit = 5,
  showMySales = false,
  showAll = false,
  itemsPerPage = 20,
}) => {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales', showMySales],
    queryFn: showMySales ? saleService.getMySales : saleService.getSales
  });

  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular vendas para exibição
  const displaySales = showAll ? sales : sales.slice(0, limit);

  // Calcular paginação
  const totalPages = showAll ? Math.ceil(sales.length / itemsPerPage) : 1;
  const startIndex = showAll ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = showAll ? startIndex + itemsPerPage : sales.length;
  const currentSales = showAll ? sales.slice(startIndex, endIndex) : displaySales;

  // Funções de paginação
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
    <div className="space-y-6">
      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {showAll && (
              <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages} • {sales.length} vendas no total
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {sale.product?.name || 'Produto não encontrado'}
                  </TableCell>
                  <TableCell className="text-center">{sale.quantity || 0}</TableCell>
                  <TableCell>
                    {formatValue(sale.product?.salePrice ? sale.product.salePrice * sale.quantity : 0)}
                  </TableCell>
                  <TableCell>
                    {sale.user?.name || 'Vendedor não encontrado'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(sale.saleDate)}
                    </div>
                  </TableCell>
                  <TableCell className={getPaymentMethodColor(sale.paymentMethod)}>
                    {sale.paymentMethod || 'Não especificado'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {showAll && totalPages > 1 && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {startIndex + 1}-{Math.min(endIndex, sales.length)} de {sales.length} vendas
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                {/* Números das páginas */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNumber)}
                        className="w-10 h-10 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTable;
