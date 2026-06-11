import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Clock, MapPin, Receipt, Home, Radar } from 'lucide-react'
import { orderAPI } from '../../services/api'
import { format } from 'date-fns'

export default function OrderConfirmPageImpl() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => { orderAPI.get(id).then(r => setOrder(r.data.data)) }, [id])

  if (!order) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse">🎉</div></div>

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        {/* Success */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-ink-900">Order Placed!</h1>
          <p className="text-ink-400 mt-1">Your food is being prepared</p>
        </div>

        {/* Order number */}
        <div className="card p-5 mb-4 text-center border-2 border-dashed border-flame-200 bg-flame-50/50">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-1">Order Reference</p>
          <p className="text-3xl font-black text-flame-500 font-mono">{order.orderNumber}</p>
          <p className="text-sm text-ink-500 mt-1">from {order.restaurant?.name}</p>
        </div>

        {/* Items */}
        <div className="card p-5 mb-4">
          <h3 className="font-bold text-ink-900 mb-3">What you ordered</h3>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-ink-700">{item.quantity}× {item.menuItemName}</span>
                <span className="font-semibold text-ink-900">{item.subtotal.toLocaleString()} RWF</span>
              </div>
            ))}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 border-t border-ink-100 pt-2">
                <span>Discount</span><span>−{order.discountAmount.toLocaleString()} RWF</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-ink-900 border-t border-ink-100 pt-2">
              <span>Total</span><span className="text-flame-500">{order.totalPrice.toLocaleString()} RWF</span>
            </div>
          </div>
          {order.specialInstructions && (
            <div className="mt-3 bg-ink-50 rounded-xl p-3 text-sm text-ink-500">📝 {order.specialInstructions}</div>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="card p-4 text-center">
            <Clock size={20} className="text-flame-500 mx-auto mb-1" />
            <p className="text-xs text-ink-400">Ready by</p>
            <p className="font-bold text-sm text-ink-900">{order.estimatedReadyAt ? format(new Date(order.estimatedReadyAt), 'HH:mm') : '—'}</p>
          </div>
          <div className="card p-4 text-center">
            <MapPin size={20} className="text-flame-500 mx-auto mb-1" />
            <p className="text-xs text-ink-400">Pickup at</p>
            <p className="font-bold text-sm text-ink-900">{order.restaurant?.location}</p>
          </div>
        </div>

        <div className="bg-flame-50 border border-flame-200 rounded-2xl p-4 text-center mb-5">
          <Receipt size={18} className="text-flame-500 mx-auto mb-1" />
          <p className="font-semibold text-flame-700 text-sm">Show this order number at pickup</p>
        </div>

        <div className="flex gap-3">
          <Link to={`/order/track/${order.id}`} className="btn btn-primary flex-1">
            <Radar size={16} />Track Order
          </Link>
          <Link to="/" className="btn btn-secondary flex-1">
            <Home size={16} />Home
          </Link>
        </div>
      </div>
    </div>
  )
}
