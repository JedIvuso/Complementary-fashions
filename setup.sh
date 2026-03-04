#!/bin/bash
# =======================================================
# Complementary Fashions - Development Setup Script
# =======================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   🧶  Complementary Fashions - Setup                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "→ Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required."; exit 1; }
echo "  ✅ Node $(node --version), npm $(npm --version)"

# Setup backend
echo ""
echo "→ Installing backend dependencies..."
cd backend
cp .env.example .env 2>/dev/null || true
npm install
echo "  ✅ Backend dependencies installed"
echo "  ⚠️  Edit backend/.env with your database and M-Pesa credentials"
cd ..

# Setup public frontend
echo ""
echo "→ Installing public frontend dependencies..."
cd frontend-public
npm install
echo "  ✅ Public frontend dependencies installed"
cd ..

# Setup admin frontend
echo ""
echo "→ Installing admin frontend dependencies..."
cd frontend-admin
npm install
echo "  ✅ Admin frontend dependencies installed"
cd ..

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ✅  Setup Complete!                                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "  1. Set up PostgreSQL database:"
echo "     createdb complementary_fashions"
echo ""
echo "  2. Configure backend/.env with your credentials"
echo ""
echo "  3. Start the backend:"
echo "     cd backend && npm run start:dev"
echo ""
echo "  4. Start the public storefront (new terminal):"
echo "     cd frontend-public && npm start"
echo "     → http://localhost:4200"
echo ""
echo "  5. Start the admin panel (new terminal):"
echo "     cd frontend-admin && npm start"
echo "     → http://localhost:4201"
echo ""
echo "  6. Default admin credentials:"
echo "     Email:    admin@complementaryfashions.com"
echo "     Password: Admin@1234"
echo "     ⚠️  Change these immediately in production!"
echo ""
echo "  API Docs: http://localhost:3000/api/docs"
echo ""
echo "  Or run everything with Docker:"
echo "     docker-compose up --build"
echo ""
