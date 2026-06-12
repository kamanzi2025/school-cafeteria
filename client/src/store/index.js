import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Cart — supports items from multiple restaurants
export const useCartStore = create(persist((set, get) => ({
  items: [],
  addItem: (item, restaurant) => {
    const existing = get().items.find(i => i.id === item.id)
    if (existing) set({ items: get().items.map(i => i.id === item.id ? { ...i, qty: i.qty+1 } : i) })
    else set({ items: [...get().items, { ...item, qty: 1, restaurantId: restaurant.id, restaurantName: restaurant.name, restaurantEmoji: restaurant.emoji || '🍽️' }] })
    return 'added'
  },
  setQty: (id, qty) => { if (qty < 1) { get().remove(id); return } set({ items: get().items.map(i => i.id===id ? { ...i, qty } : i) }) },
  remove: (id) => set({ items: get().items.filter(i => i.id!==id) }),
  clear: () => set({ items: [] }),
  subtotal: () => get().items.reduce((s,i) => s+i.price*i.qty, 0),
  count: () => get().items.reduce((s,i) => s+i.qty, 0),
  byRestaurant: () => {
    const groups = {}
    for (const item of get().items) {
      if (!groups[item.restaurantId]) groups[item.restaurantId] = { id: item.restaurantId, name: item.restaurantName, emoji: item.restaurantEmoji, items: [] }
      groups[item.restaurantId].items.push(item)
    }
    return Object.values(groups)
  },
}), { name: 'cc-cart-v4' }))

// Customer (registered or guest)
export const useCustomerStore = create(persist((set) => ({
  customer: null, token: null, guestToken: null,
  login: (customer, token) => set({ customer, token }),
  setGuest: (customer, token, guestToken) => set({ customer, token, guestToken }),
  update: (data) => set(s => ({ customer: { ...s.customer, ...data } })),
  logout: () => set({ customer: null, token: null, guestToken: null }),
}), { name: 'cc-customer-v4' }))

// Restaurant Admin (owner or staff)
export const useAdminStore = create(persist((set) => ({
  admin: null, token: null, restaurant: null, role: null,
  loginOwner: (restaurant, token) => set({ restaurant, token, admin: { name: restaurant.ownerName, email: restaurant.ownerEmail }, role: 'owner' }),
  loginStaff: (staff, restaurant, token) => set({ admin: staff, restaurant, token, role: staff.role }),
  updateRestaurant: (r) => set(s => ({ restaurant: { ...s.restaurant, ...r } })),
  logout: () => set({ admin: null, token: null, restaurant: null, role: null }),
}), { name: 'cc-admin-v3' }))

// UI
export const useUIStore = create((set) => ({
  cartOpen: false, openCart: () => set({ cartOpen: true }), closeCart: () => set({ cartOpen: false }),
}))
