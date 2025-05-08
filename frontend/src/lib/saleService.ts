import api from './api';

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  value: number;
  sellerId: number;
  sellerName: string;
  date: Date;
  paymentMethod: "Pix" | "Dinheiro" | "Débito" | "Crédito";
}

export const saleService = {
  async getSales(): Promise<Sale[]> {
    const response = await api.get('/sales');
    return response.data;
  },

  async getMySales(): Promise<Sale[]> {
    const response = await api.get('/sales/my-sales');
    return response.data;
  },

  async createSale(data: { productId: number; quantity: number; paymentMethod: string }): Promise<Sale> {
    const response = await api.post('/sales', data);
    return response.data;
  },

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    const response = await api.get('/sales/by-date-range', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data;
  },

  async getSalesByDate(date: string): Promise<Sale[]> {
    const response = await api.get(`/sales/date/${date}`);
    return response.data;
  }
}; 