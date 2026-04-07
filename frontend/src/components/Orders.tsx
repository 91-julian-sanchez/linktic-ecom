import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Clock, CheckCircle } from 'lucide-react';

export default function Orders({ refreshKey }: { refreshKey: number }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.orders.getAll()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <div className="loader"></div>;
  if (!orders.length) return <div style={{ color: 'var(--text-muted)' }}>No orders found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {orders.map(order => (
        <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Order ID: {order.id}</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{order.customerEmail}</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>${order.totalAmount}</span>
              <span className={`badge ${order.status === 'COMPLETED' ? 'badge-success' : 'badge-pending'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {order.status === 'COMPLETED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                {order.status}
              </span>
            </div>
          </div>
          
          <div>
            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {order.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '6px' }}>
                  <span>{item.quantity}x {item.productName}</span>
                  <span style={{ color: 'var(--text-muted)' }}>${item.unitPrice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
