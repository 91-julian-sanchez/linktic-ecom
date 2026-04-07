import { useState } from 'react';
import Products from './components/Products';
import Orders from './components/Orders';
import { api } from './lib/api';
import { ShoppingBag, Box, Activity, Trash2 } from 'lucide-react';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [email, setEmail] = useState('user@test.linktic');
  const [refreshOrders, setRefreshOrders] = useState(0);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleCheckout = async () => {
    if (!cart.length) return;
    try {
      await api.orders.create({
        customerEmail: email,
        items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity }))
      });
      setCart([]);
      setRefreshOrders(prev => prev + 1);
      setActiveTab('orders');
      alert('Order created successfully!');
    } catch (e: any) {
      alert(e.message || 'Error processing checkout');
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar glass-panel" style={{ padding: '1rem 2rem' }}>
        <div className="brand">
          <Activity size={28} /> Linktic Ecom
        </div>
        <div className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
          >
            <Box size={18} /> Catalog
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
          >
             Orders
          </button>
        </div>
      </nav>

      <main style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {activeTab === 'products' ? 'Discover Products' : 'Your Orders'}
          </h1>
          {activeTab === 'products' ? (
            <Products onAddToCart={handleAddToCart} />
          ) : (
            <Orders refreshKey={refreshOrders} />
          )}
        </div>

        {activeTab === 'products' && (
          <aside className="glass-panel" style={{ width: '350px', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <ShoppingBag size={24} color="var(--primary)" />
              Shopping Cart ({cart.length})
            </h2>

            {cart.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>Your cart is empty.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.product.name}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} x ${item.product.price}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                      aria-label="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <div style={{ borderTop: '1px solid var(--border)', margin: '1rem 0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Total:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>${cartTotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email (Checkout)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem', color: 'white' }} 
                  />
                </div>

                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={handleCheckout}>
                  Complete Checkout
                </button>
              </div>
            )}
          </aside>
        )}
      </main>
    </div>
  );
}
