const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  products: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  },
  orders: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    create: async (data: { customerEmail: string, items: { productId: string, quantity: number }[] }) => {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    }
  }
};
