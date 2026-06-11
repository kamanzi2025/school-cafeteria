import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, X, Star, Loader } from 'lucide-react'
import { orderAPI, reviewAPI } from '../../services/api'
import { useSocket } from '../../hooks/useSocket'
import { useCustomerStore } from '../../store'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'pending', emoji: '📋', label: 'Order Placed', sub: 'Waiting for confirmation' },
  { key: 'confirmed', emoji: '✅', label: 'Confirmed', sub: 'Restaurant accepted your order' },
  { key: 'preparing', emoji: '👨‍🍳', label: 'Being Prepared', sub: 'Your food is cooking right now' },
  { key: 'ready', emoji: '🎉', label: 'Ready!', sub: 'Go pick up at the counter' },
]
const STATUS_IDX = { pending: 0, confirmed: 1, preparing: 2, ready: 3, picked_up: 4 }

export default function TrackOrderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const [review, setReview] = useState({ foodRating: 5, serviceRating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const { student } = useCustomerStore()

  const socket = useSocket({
    'order:updated': (updated) => { if (updated.id === id) { setOrder(updated); toast.success(`Order status: ${updated.status.replace('_', ' ')} 🔔`) } }
  })

  useEffect(() => {
    socket.emit('join:order', id)
    orderAPI.get(id).then(r => setOrder(r.data.data)).catch(() => navigate('/orders'))
    return () => socket.emit('leave:order', id)
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return
    try {
      const res = await orderAPI.cancel(id, 'Cancelled by student')
      setOrder(res.data.data)
      toast.success('Order cancelled')
    } catch (e) { toast.error(e.response?.data?.error || 'Cannot cancel') }
  }

  const submitReview = async () => {
    setSubmitting(true)
    try {
      await reviewAPI.create({ orderId: id, studentId: student.studentId, ...review })
      toast.success('Review submitted! 🙏')
      setShowReview(false)
      setOrder(prev => ({ ...prev, review: review }))
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
    finally { setSubmitting(false) }
  }

  if (!order) return <div className="min-h-screen flex items-center justify-center"><Loader size={24} className="animate-spin text-flame-500" /></div>

  const currentIdx = STATUS_IDX[order.status] ?? 0
  const isCancelled = order.status === 'cancelled'
  const isDone = order.status === 'picked_up'

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="gradient-dark text-white px-4 pt-4 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-lg">Track Order</h1>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-white/50 text-xs mb-1">Order Number</p>
            <p className="font-black text-2xl font-mono text-flame-300">{order.orderNumber}</p>
            <p className="text-white/60 text-sm mt-1">{order.restaurant?.name} · {order.totalPrice.toLocaleString()} RWF</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-10">
        {/* Status card */}
        <div className="card p-5 mb-4 -mt-1">
          {isCancelled ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">❌</div>
              <h2 className="font-bold text-xl text-red-600">Order Cancelled</h2>
              {order.cancelReason && <p className="text-ink-400 text-sm mt-1">{order.cancelReason}</p>}
            </div>
          ) : isDone ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">🍽️</div>
              <h2 className="font-bold text-xl text-emerald-600">Picked Up!</h2>
              <p className="text-ink-400 text-sm">Enjoy your meal!</p>
              {!order.review && student && (
                <button onClick={() => setShowReview(true)} className="btn btn-primary mt-4">
                  <Star size={15} />Leave a Review
                </button>
              )}
            </div>
          ) : (
            <>
              {order.status === 'ready' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-center">
                  <p className="font-bold text-emerald-700 text-lg">🎉 Ready for pickup!</p>
                  <p className="text-emerald-600 text-sm">Head to {order.restaurant?.location} now</p>
                </div>
              )}
              <div className="space-y-2">
                {STEPS.map((step, i) => {
                  const done = i <= currentIdx
                  const current = i === currentIdx
                  return (
                    <div key={step.key} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${current ? 'bg-flame-50 border border-flame-200' : done ? 'opacity-70' : 'opacity-30'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-flame-500' : 'bg-ink-100'}`}>
                        {done ? <CheckCircle size={18} className="text-white" /> : <span className="text-lg">{step.emoji}</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${current ? 'text-flame-700' : 'text-ink-700'}`}>{step.label}</p>
                        <p className="text-xs text-ink-400">{step.sub}</p>
                      </div>
                      {current && <div className="w-2 h-2 bg-flame-500 rounded-full animate-pulse" />}
                    </div>
                  )
                })}
              </div>
              {order.estimatedReadyAt && (
                <div className="mt-3 bg-ink-50 rounded-xl p-3 flex items-center gap-2 text-sm text-ink-600">
                  <Clock size={15} className="text-flame-500 shrink-0" />
                  Ready at <strong className="ml-1">{format(new Date(order.estimatedReadyAt), 'HH:mm')}</strong>
                  <span className="text-ink-400 ml-1">({formatDistanceToNow(new Date(order.estimatedReadyAt), { addSuffix: true })})</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order items */}
        <div className="card p-4 mb-4">
          <h3 className="font-bold text-ink-900 mb-3">Order Summary</h3>
          <div className="space-y-1.5">
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-ink-600">{item.quantity}× {item.menuItemName}</span>
                <span className="font-medium text-ink-900">{item.subtotal.toLocaleString()} RWF</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-ink-900 border-t border-ink-100 pt-2 mt-2">
              <span>Total</span><span>{order.totalPrice.toLocaleString()} RWF</span>
            </div>
          </div>
        </div>

        {order.status === 'pending' && (
          <button onClick={handleCancel} className="btn btn-danger w-full mb-3">
            <X size={16} />Cancel Order
          </button>
        )}
        <Link to="/orders" className="btn btn-secondary w-full">My Order History</Link>
      </div>

      {/* Review modal */}
      {showReview && (
        <div className="fixed inset-0 bg-ink-950/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-bold text-lg text-ink-900 mb-4">How was your order?</h3>
            {[['Food', 'foodRating'], ['Service', 'serviceRating']].map(([label, key]) => (
              <div key={key} className="mb-4">
                <p className="text-sm font-medium text-ink-600 mb-2">{label}</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReview(r => ({ ...r, [key]: n }))}
                      className={`text-2xl transition-transform hover:scale-110 ${n <= review[key] ? '' : 'grayscale opacity-40'}`}>⭐</button>
                  ))}
                </div>
              </div>
            ))}
            <textarea value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
              placeholder="Share your experience…" className="input resize-none h-24 mb-4 text-sm" />
            <div className="flex gap-3">
              <button onClick={() => setShowReview(false)} className="btn btn-secondary flex-1">Skip</button>
              <button onClick={submitReview} disabled={submitting} className="btn btn-primary flex-1">
                {submitting ? <Loader size={14} className="animate-spin" /> : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
