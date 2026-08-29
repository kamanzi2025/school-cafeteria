# 🍽️ CaféCampus v3 — Full School Cafeteria Ordering Platform

## What's New in v3

### ✅ Restaurant Self-Registration
Restaurants create their own account at `/restaurant/auth` — no admin needed. Fill in owner details, restaurant name, emoji, category and they go live **instantly** on the student app.

### ✅ Restaurant Account Deletion
Owners can permanently delete their account from Settings → Danger Zone. Requires password confirmation. The restaurant **disappears immediately** from the student app via real-time socket event.

### ✅ Three Ways for Customers to Order
1. **Guest** — no account needed, just enter a name and start ordering
2. **Register** — full account with email + password, order history, loyalty points
3. **Student ID login** — log in with student ID + password

### ✅ Guest Upgrade Path
Guests can upgrade to a full account from their profile page without losing their session.

### ✅ Super Admin Panel
At `/superadmin` — oversee all restaurants, suspend/approve, view platform stats, force-delete restaurants.

---

## 🚀 Setup

```bash
# 1. Install everything
npm run install:all

# 2. Set up database + seed demo data
cd server && npx prisma db push && node src/prisma/seed.js && cd ..

# 3. Start the app
npm run dev
```

- **Student app** → http://localhost:5173
- **Restaurant registration/login** → http://localhost:5173/restaurant/auth
- **Super admin** → http://localhost:5173/superadmin

---

## 🔑 Credentials

Seed passwords are no longer hardcoded or published here. Running `node src/prisma/seed.js` generates a random password for each account tier (super admin, restaurant owners, demo customers) and prints them once to the console — save them from that output. To set your own instead, export `SEED_SUPERADMIN_PASSWORD`, `SEED_RESTAURANT_PASSWORD`, and `SEED_CUSTOMER_PASSWORD` before running the seed script.

### Accounts created by the seed script
- **Super Admin** — username `superadmin`, login at `/superadmin`
- **Restaurant owners** (one shared password across all demo restaurants) — amina@mamaafrica.rw, james@burgerspot.rw, sophie@greenbowl.rw, marco@pizzapalace.rw, lin@dragonwok.rw, celine@cafebj.rw, raj@spiceroute.rw
- **Demo customers** (one shared password) — alice@school.ac.rw / STU001, bob@school.ac.rw / STU002
- Or order as a **Guest** — no account needed

---

## Architecture

| | |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand (persisted) |
| Backend | Node.js + Express |
| Database | SQLite via Prisma (swap to Postgres for production) |
| Real-time | Socket.io |
| Auth | JWT tokens (owner, staff, customer, guest, superadmin types) |

## Key Flows

### Restaurant registers itself:
`/restaurant/auth` → Register tab → fills form → gets JWT → lands on dashboard

### Restaurant deletes itself:
`/admin/settings` → Danger Zone → confirm password → soft-deleted → socket broadcasts to all students → disappears from home page

### Guest orders:
Home → pick restaurant → add to cart → "Continue as Guest" → place order → track order

### Customer registers:
`/auth` → Create Account tab → email + password → full account
