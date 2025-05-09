import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, Product } from "@/lib/productService";
import { saleService } from "@/lib/saleService";
import { toast } from "sonner";

const paymentMethods = [
  { value: "Pix", label: "Pix" },
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Débito", label: "Débito" },
  { value: "Crédito", label: "Crédito" },
];

const SaleForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [totalValue, setTotalValue] = useState<number>(0);

  // Buscar produtos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts
  });

  // Mutação para criar venda
  const createSaleMutation = useMutation({
    mutationFn: saleService.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: "Venda Registrada",
        description: "A venda foi registrada com sucesso.",
      });
      // Reset form
      setSelectedProduct(null);
      setQuantity(1);
      setSalePrice(0);
      setPaymentMethod("");
      setTotalValue(0);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a venda.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        setSalePrice(product.salePrice);
        setTotalValue(product.salePrice * quantity);
      }
    }
  }, [selectedProduct, quantity, products]);

  const handleProductChange = (productId: string) => {
    setSelectedProduct(parseInt(productId));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 0;
    setQuantity(newQuantity);
  };

  const handleSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value) || 0;
    setSalePrice(newPrice);
    setTotalValue(newPrice * quantity);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !paymentMethod) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const selectedProductData = products.find(p => p.id === selectedProduct);
    if (!selectedProductData) return;

    createSaleMutation.mutate({
      productId: selectedProduct,
      productName: selectedProductData.name,
      quantity,
      value: totalValue,
      sellerId: user?.id || "",
      paymentMethod: paymentMethod as "Pix" | "Dinheiro" | "Débito" | "Crédito"
    });
  };
  
  const selectedProductData = products.find(p => p.id === selectedProduct);
  const maxAvailableStock = selectedProductData?.stockQuantity || 0;

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Select value={selectedProduct} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - R$ {product.salePrice.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxAvailableStock}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Estoque disponível: {maxAvailableStock}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salePrice">Preço Unitário (R$)</Label>
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              value={salePrice}
              onChange={handleSalePriceChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pix">Pix</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Débito">Débito</SelectItem>
                <SelectItem value="Crédito">Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-2xl font-bold text-primary-purple">
              {formatValue(totalValue)}
            </span>
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto">
          Registrar Venda
        </Button>
      </form>
    </div>
  );
};

export default SaleForm;
