# 🧶 Complementary Fashions — Full-Stack E-Commerce

A production-ready crochet clothing store with a public storefront + admin panel.

## Tech Stack
- **Backend**: NestJS 10 + TypeORM + PostgreSQL + Passport JWT
- **Public Frontend**: Angular 17 (standalone, signals)
- **Admin Panel**: Angular 17 (standalone, signals)
- **Payments**: M-Pesa STK Push (Paybill)
- **Containers**: Docker + Docker Compose

## Quick Start (Local Dev)

### Prerequisites: Node.js ≥ 18, PostgreSQL ≥ 14

```bash
# 1. Run setup
chmod +x setup.sh && ./setup.sh

# 2. Create DB
psql -U postgres -c "CREATE USER cf_user WITH PASSWORD 'cf_secure_password';"
psql -U postgres -c "CREATE DATABASE complementary_fashions OWNER cf_user;"

# 3. Configure (edit DB, JWT, M-Pesa, mail settings)
cp backend/.env.example backend/.env

# 4. Run (3 terminals)
cd backend && npm run start:dev          # → localhost:3000/api
cd frontend-public && npm start          # → localhost:4200
cd frontend-admin && npm start           # → localhost:4201
```

### Default Admin
```
Email:    admin@complementaryfashions.com
Password: Admin@1234
```

## Docker (All-in-one)
```bash
docker-compose up --build
```

## API Docs
http://localhost:3000/api/docs (Swagger UI)

## M-Pesa Setup
Register at https://developer.safaricom.co.ke and add credentials to `backend/.env`.

## Key Features

### Public Storefront
- Hero slideshow with CTA banners
- Category browsing + product grid with search/filter
- Product detail with image gallery + size variants
- Shopping cart (persisted per user)
- M-Pesa checkout with real-time payment verification
- Order history
- Favorites/wishlist
- Light/Dark mode

### Admin Panel
- Dashboard with revenue charts + recent orders
- Product CRUD with multi-image upload + variants
- Category management with reordering
- Hero banner management
- Order management (filter, status update, CSV export)
- Customer management (view, block/unblock)
- About & branding editor (logo, colours, social links)
