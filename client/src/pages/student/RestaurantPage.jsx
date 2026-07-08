import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Clock, MapPin, Phone, Plus, Minus, ShoppingBag, Flame, Leaf, Zap, AlertCircle, Heart, Search } from 'lucide-react'
import { restaurantAPI } from '../../services/api'
import { useCartStore, useCustomerStore, useUIStore } from '../../store'
import CartDrawer from '../../components/student/CartDrawer'
import toast from 'react-hot-toast'

export default function RestaurantPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [favorited, setFavorited] = useState(false)
  const { items, addItem, setQty } = useCartStore()
  const { customer: student } = useCustomerStore()
  const { openCart } = useUIStore()
  const cartCount = items.reduce((s, i) => s + i.qty, 0)

  useEffect(() => {
    restaurantAPI.get(id).then(r => {
      setRestaurant(r.data.data)
      setFavorited(r.data.data.isFavorited)
      const cats = [...new Set(r.data.data.items.map(i => i.category?.name).filter(Boolean))]
      setActiveCategory(cats[0] || null)
      setLoading(false)
    }).catch(() => { setLoading(false); navigate('/') })
  }, [id])

  const getQty = (itemId) => items.find(i => i.id === itemId)?.qty || 0

  const handleAdd = (item) => {
    if (!student) { toast.error('Sign in to order'); navigate('/auth'); return }
    addItem(
      { id: item.id, name: item.name, price: item.price, emoji: item.emoji },
      { id: restaurant.id, name: restaurant.name, emoji: restaurant.emoji }
    )
    toast.success(`${item.name} added!`)
  }

  const categories = restaurant ? [...new Set(restaurant.items.map(i => i.category?.name).filter(Boolean))] : []
  const featuredItems = restaurant?.items.filter(i => i.isFeatured) || []

  const displayItems = restaurant?.items.filter(i => {
    const matchCat = !activeCategory || i.category?.name === activeCategory
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  }) || []

  if (loading) return (
    <div className="min-h-screen bg-alu-bg flex items-center justify-center">
      <div className="text-center animate-pulse"><div className="text-5xl mb-3">🍽️</div><p className="text-alu-muted">Loading menu…</p></div>
    </div>
  )
  if (!restaurant) return null

  return (
    <div className="min-h-screen bg-alu-bg">
      {/* Hero */}
      <div className="relative text-white" style={{ background: `linear-gradient(160deg, ${restaurant.coverColor}dd, ${restaurant.coverColor}99)` }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 11px)' }} />
        <div className="page-container relative z-10 pt-4 pb-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)} className="w-9 h-9 bg-black/20 hover:bg-black/30 rounded-xl flex items-center justify-center transition backdrop-blur-sm">
              <ArrowLeft size={18} />
            </button>
            <button onClick={openCart} className="relative w-9 h-9 bg-black/20 hover:bg-black/30 rounded-xl flex items-center justify-center transition backdrop-blur-sm">
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-flame-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>

          <div className="flex items-end gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-float shrink-0 overflow-hidden">
              {restaurant.logo
                ? <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
                : <span className="text-5xl">{restaurant.emoji}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`badge text-xs ${restaurant.isOpen ? 'bg-white/30 text-white' : 'bg-red-500/30 text-red-100'}`}>
                  {restaurant.isOpen ? '● Open' : '● Closed'}
                </span>
                {!restaurant.isAccepting && restaurant.isOpen && (
                  <span className="badge bg-amber-500/30 text-amber-100">Paused</span>
                )}
              </div>
              <h1 className="font-black text-2xl text-white leading-tight">{restaurant.name}</h1>
              <p className="text-white/70 text-sm mt-0.5 line-clamp-2">{restaurant.description}</p>
              <div className="flex items-center gap-4 mt-2 text-white/70 text-xs">
                {restaurant.ratingCount > 0 && <span className="flex items-center gap-1"><Star size={11} className="fill-amber-300 text-amber-300" />{restaurant.rating} ({restaurant.ratingCount})</span>}
                <span className="flex items-center gap-1"><Clock size={11} />{restaurant.prepTimeMin}–{restaurant.prepTimeMax} min</span>
                <span className="flex items-center gap-1"><MapPin size={11} />{restaurant.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notice banner */}
      {restaurant.notice && (
        <div className="bg-alu-gold/10 border-b border-alu-gold/25 page-container py-2.5">
          <p className="text-alu-gold text-sm flex items-center gap-2"><AlertCircle size={14} className="shrink-0" />{restaurant.notice}</p>
        </div>
      )}

      {/* Closed banner */}
      {!restaurant.isOpen && (
        <div className="bg-red-900/20 border-b border-red-800/30 page-container py-3">
          <p className="text-red-400 font-semibold text-sm text-center">This restaurant is currently closed · Opens {restaurant.openTime}</p>
        </div>
      )}

      {/* Featured strip */}
      {featuredItems.length > 0 && (
        <div className="bg-alu-surface border-b border-alu-border">
          <div className="page-container py-4">
            <p className="text-xs font-bold text-alu-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Flame size={13} className="text-flame-500" /> Featured
            </p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
              {featuredItems.map(item => (
                <button key={item.id} onClick={() => setActiveCategory(item.category?.name)}
                  className="flex-none flex flex-col items-center gap-1.5 w-24 group">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition group-hover:scale-105"
                    style={{ background: `${restaurant.coverColor}25` }}>
                    {item.emoji}
                  </div>
                  <p className="text-xs font-medium text-alu-cream text-center leading-tight line-clamp-2">{item.name}</p>
                  <p className="text-xs font-bold text-flame-500">{item.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category tabs + search */}
      <div className="sticky top-0 z-20 bg-alu-surface border-b border-alu-border">
        <div className="page-container">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeCategory === c ? 'border-flame-500 text-flame-500' : 'border-transparent text-alu-muted hover:text-alu-cream'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="page-container py-4 pb-24">
        {/* Search within menu */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alu-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search this menu…" className="input pl-9 py-2 text-sm" />
        </div>

        <div className="space-y-3">
          {displayItems.map(item => {
            const qty = getQty(item.id)
            const canOrder = restaurant.isOpen && restaurant.isAccepting && item.isAvailable
            return (
              <div key={item.id} className={`card flex gap-4 p-4 transition-opacity ${!item.isAvailable ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-0.5">
                    <h3 className="font-semibold text-alu-cream text-sm">{item.name}</h3>
                    {item.isFeatured && <span className="badge bg-flame-500/20 text-flame-400 text-[10px]">★ Featured</span>}
                    {item.isPopular && <span className="badge bg-purple-900/30 text-purple-400 text-[10px]">🔥 Popular</span>}
                    {item.isVegan && <span className="badge bg-green-900/30 text-green-400 text-[10px]">Vegan</span>}
                    {!item.isVegan && item.isVeg && <span className="badge bg-green-900/20 text-green-500 text-[10px]">Veg</span>}
                    {item.isSpicy && <span className="badge bg-red-900/30 text-red-400 text-[10px]">Spicy 🌶</span>}
                  </div>
                  {item.description && <p className="text-xs text-alu-muted mt-0.5 line-clamp-2">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="font-bold text-flame-500">{item.price.toLocaleString()} RWF</span>
                    {item.originalPrice && <span className="text-xs text-alu-muted line-through">{item.originalPrice.toLocaleString()}</span>}
                    {item.calories && <span className="text-xs text-alu-muted flex items-center gap-0.5"><Flame size={10} />{item.calories} cal</span>}
                    <span className="text-xs text-alu-muted flex items-center gap-0.5"><Clock size={10} />{item.prepTime} min</span>
                  </div>
                  {item.allergens && JSON.parse(item.allergens).length > 0 && (
                    <p className="text-[10px] text-alu-gold mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />Contains: {JSON.parse(item.allergens).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 justify-between shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
                    style={{ background: `${restaurant.coverColor}20` }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">{item.emoji}</div>}
                  </div>
                  {canOrder ? (
                    qty > 0 ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQty(item.id, qty - 1)} className="w-7 h-7 rounded-lg border border-alu-border flex items-center justify-center text-alu-cream hover:bg-alu-red/10 hover:border-alu-red/30 transition">
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-sm text-alu-cream w-4 text-center">{qty}</span>
                        <button onClick={() => handleAdd(item)} className="w-7 h-7 rounded-lg bg-flame-500 flex items-center justify-center text-white hover:bg-flame-600 transition">
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleAdd(item)} className="w-7 h-7 rounded-lg bg-flame-500 flex items-center justify-center text-white hover:bg-flame-600 transition active:scale-95">
                        <Plus size={14} />
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] text-alu-muted text-center">{!item.isAvailable ? '86\'d' : 'Closed'}</span>
                  )}
                </div>
              </div>
            )
          })}
          {displayItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-alu-muted/60 text-sm">No items match your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-20 px-4">
          <button onClick={openCart} className="btn btn-primary btn-lg shadow-glow-lg animate-scale-in">
            <ShoppingBag size={18} />
            {cartCount} item{cartCount > 1 ? 's' : ''} in cart
          </button>
        </div>
      )}

      <CartDrawer />
    </div>
  )
}
