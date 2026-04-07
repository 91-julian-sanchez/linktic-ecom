import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ShoppingCart, Package } from 'lucide-react';

export default function Products({ onAddToCart }: { onAddToCart: (p: any) => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.getAll()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"></div>;

  return (
    <div className="grid grid-cols-3">
      {products.map(product => (
        <div key={product.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
              <Package size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{product.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>SKU: {product.sku}</p>
            </div>
          </div>
          
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>{product.description}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>${product.price}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: product.stock > 0 ? 'var(--success)' : '#ef4444' }}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
            <button 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem'}}
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
            >
              <ShoppingCart size={18} />
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
