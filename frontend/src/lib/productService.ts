import api from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stockQuantity: number;
}

interface ProductDTO {
  name: string;
  description: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products');
      return response.data.map((product: any) => ({
        ...product,
        stockQuantity: product.quantity
      }));
    } catch (error: any) {
      throw error;
    }
  },

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return {
        ...response.data,
        stockQuantity: response.data.quantity
      };
    } catch (error: any) {
      throw error;
    }
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const productDTO: ProductDTO = {
        name: product.name,
        description: product.description,
        category: product.category,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        quantity: product.stockQuantity
      };
      const response = await api.post('/products', productDTO);
      return {
        ...response.data,
        stockQuantity: response.data.quantity
      };
    } catch (error: any) {
      throw error;
    }
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    try {
      const productDTO: Partial<ProductDTO> = {
        name: product.name,
        description: product.description,
        category: product.category,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        quantity: product.stockQuantity
      };
      const response = await api.put(`/products/${id}`, productDTO);
      return {
        ...response.data,
        stockQuantity: response.data.quantity
      };
    } catch (error: any) {
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error: any) {
      throw error;
    }
  }
}; 