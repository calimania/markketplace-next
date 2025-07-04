'use client';

import { useContext, useState } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';
import { Order } from '@/markket/';

const OrderDetailsModal = ({ order, onClose }: { order: any, onClose: () => void }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-2">Order Details</h2>
        <div className="mb-2 text-sm text-gray-700">
          <div><b>Order ID:</b> {order.uuid || order.documentId}</div>
          <div><b>Status:</b> {order.Status}</div>
          <div><b>Amount:</b> {order.Amount} {order.Currency}</div>
          <div><b>Buyer Email:</b> {order.Shipping_Address?.email || order.buyer_email || '—'}</div>
          <div><b>Date:</b> {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</div>
          <div><b>Shipping Address:</b> {order.Shipping_Address ? (
            <div className="ml-2">
              <div>{order.Shipping_Address.name}</div>
              <div>{order.Shipping_Address.street} {order.Shipping_Address.street_2}</div>
              <div>{order.Shipping_Address.city}, {order.Shipping_Address.state} {order.Shipping_Address.zipcode}</div>
              <div>{order.Shipping_Address.country}</div>
              <div>{order.Shipping_Address.email}</div>
            </div>
          ) : '—'}</div>
          <div><b>Products:</b> {order.Details?.map((d: any, i: number) => (
            <div key={i} className="ml-2">{d.Name} - {d.Price}</div>
          ))}</div>
          <div><b>Payment Attempts:</b> {order.Payment_attempts?.length ? order.Payment_attempts.map((a: any, i: number) => (
            <div key={i} className="ml-2">{a.Status} at {a.Timestampt ? new Date(a.Timestampt).toLocaleString() : ''} ({a.reason || ''})</div>
          )) : '—'}</div>
        </div>
      </div>
    </div>
  );
};

const OrderTab = () => {
  const { store } = useContext(DashboardContext);
  const { items: orders, loading } = useCMSItems<Order>('orders', store);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (order: any, newStatus: string) => {
    setUpdating(order.id);
    // TODO: Replace with your API call to update order status
    await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Status: newStatus })
    });
    setUpdating(null);
    // Optionally, refresh data here
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <p className='text-sm text-zinc-800'>Orders are created when a visitor requests a payment link.<br /> You can email your buyers with fullfilment questions and updates.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Buyer</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : orders?.length ? orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-2 border">
                  <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => setSelectedOrder(order)}>
                    {order.uuid || order.documentId}
                  </button>
                </td>
                <td className="p-2 border">{order.Status}</td>
                <td className="p-2 border">{order.Amount} {order.Currency}</td>
                <td className="p-2 border">{order.Shipping_Address?.email || order.buyer_email || '—'}</td>
                <td className="p-2 border">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</td>
                <td className="p-2 border flex gap-2">
                  {/* <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => setSelectedOrder(order)}>Details</button> */}
                  <select
                    className="px-2 py-1 border rounded text-xs"
                    value={order.Status}
                    disabled={updating === order.id}
                    onChange={e => handleStatusChange(order, e.target.value)}
                  >
                    <option value="open" disabled={order.Status == 'complete'}>Opened</option>
                    <option value="pending" disabled>Pending</option>
                    <option value="complete" disabled={order.Status == 'open'}>Paid {order.status}</option>
                    <option value="shipped" disabled>Shipped</option>
                    <option value="refunded" disabled>Refunded</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="p-4 text-center">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div >
  );
};

export default OrderTab;
