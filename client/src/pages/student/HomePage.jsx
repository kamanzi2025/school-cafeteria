import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, User, Star, Clock, MapPin, TrendingUp } from 'lucide-react'
import { restaurantAPI } from '../../services/api'
import { useCartStore, useCustomerStore, useUIStore } from '../../store'
import { useSocket } from '../../hooks/useSocket'
import CartDrawer from '../../components/student/CartDrawer'
import toast from 'react-hot-toast'


function RestaurantCard({ r, index }) {
  return (
    <Link to={`/restaurant/${r.id}`}
      className="card-hover group overflow-hidden flex flex-col animate-fade-up"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}>
      {/* Cover */}
      <div className="relative h-36 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${r.coverColor}22, ${r.coverColor}44)` }}>
        {r.logo
          ? <img src={r.logo} alt={r.name} className="w-20 h-20 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300" />
          : <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{r.emoji}</span>}
        <div className="absolute top-3 right-3">
          <span className={r.isOpen ? 'badge-open' : 'badge-closed'}>
            {r.isOpen ? '● Open' : '● Closed'}
          </span>
        </div>
        {r._count?.orders > 50 && (
          <div className="absolute top-3 left-3 badge bg-flame-100 text-flame-600">
            <TrendingUp size={10} /> Popular
          </div>
        )}
        {/* Colour strip at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: r.coverColor }} />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-ink-900 text-sm leading-snug">{r.name}</h3>
          {r.ratingCount > 0 && (
            <div className="flex items-center gap-0.5 shrink-0 text-xs text-ink-500">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-ink-800">{r.rating}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-ink-400 line-clamp-1 mb-3 flex-1">{r.description}</p>
        <div className="flex items-center justify-between text-xs text-ink-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {r.prepTimeMin}–{r.prepTimeMax} min
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {r.location}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { student } = useCustomerStore()
  const { count, restaurantName } = useCartStore()
  const { cartOpen, openCart, closeCart } = useUIStore()
  const cartCount = count()
  const navigate = useNavigate()

  useSocket({
    'restaurant:status': ({ restaurantId, isOpen }) =>
      setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, isOpen } : r))
  })

  useEffect(() => {
    restaurantAPI.list()
      .then(r => { setRestaurants(r.data.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = restaurants.filter(r => {
    const q = search.toLowerCase()
    return !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-ink-100">
        <div className="page-container py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 mr-2">
            <span className="text-2xl">🍽️</span>
            <div>
              <p className="font-bold text-ink-900 leading-none text-base">CaféCampus</p>
              <p className="text-[10px] text-ink-400 leading-none">School Cafeteria</p>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurants or food…"
              className="input py-2 pl-9 pr-4 text-sm bg-ink-50 border-transparent focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            {student ? (
              <Link to="/profile" className="btn btn-ghost btn-icon">
                <User size={18} />
              </Link>
            ) : (
              <Link to="/auth" className="btn btn-secondary btn-sm">Sign in</Link>
            )}
            <button onClick={openCart} className="relative btn btn-primary btn-icon">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="relative overflow-hidden gradient-dark text-white">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="page-container py-10 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-2">
            Skip the line,<br />
            <span className="text-gradient">order ahead.</span> 🍽️
          </h1>
          <p className="text-ink-400 text-sm max-w-md">
            Fresh campus food, real-time tracking, ready for pickup in minutes.
          </p>
          {cartCount > 0 && (
            <button onClick={openCart} className="mt-5 btn btn-primary">
              <ShoppingBag size={16} />
              View cart — {restaurantName}
            </button>
          )}
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: '#ff5c1a' }} />
      </div>


      {/* Restaurant grid */}
      <main className="page-container py-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-ink-100">
                <div className="skeleton h-36" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-ink-700 text-lg">No results for "{search}"</p>
            <p className="text-ink-400 text-sm mt-1">Try searching something else</p>
            <button onClick={() => setSearch('')} className="btn btn-secondary mt-4">Clear search</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-400 mb-4">{filtered.length} restaurant{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r, i) => <RestaurantCard key={r.id} r={r} index={i} />)}
            </div>
          </>
        )}
      </main>

      <CartDrawer />
    </div>
  )
}
