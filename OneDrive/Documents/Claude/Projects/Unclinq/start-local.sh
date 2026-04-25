#!/bin/bash

# ─── Unclinq — Local Dev Startup Script ────────────────────────────────────
# Run this from the project root: ./start-local.sh
# Prerequisites: Docker Desktop, Node.js 18+

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "🚀  Unclinq — Starting local development environment"
echo "────────────────────────────────────────────────────"

# ─── Step 1: Check prerequisites ────────────────────────────────────────────
echo ""
echo "1️⃣  Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  echo -e "${RED}✗ Docker not found. Please install Docker Desktop from https://www.docker.com/products/docker-desktop${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org${NC}"
  exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js found ($NODE_VERSION)${NC}"

# ─── Step 2: Check API keys ──────────────────────────────────────────────────
echo ""
echo "2️⃣  Checking API keys in backend/.env..."

if grep -q "YOUR_ANTHROPIC_API_KEY_HERE" backend/.env; then
  echo -e "${YELLOW}⚠  ANTHROPIC_API_KEY not set in backend/.env${NC}"
  echo "   → Get your key at: https://console.anthropic.com"
  echo "   → Emora and AI features won't work without it."
fi

if grep -q "YOUR_GEMINI_API_KEY_HERE" backend/.env; then
  echo -e "${YELLOW}⚠  GEMINI_API_KEY not set in backend/.env${NC}"
  echo "   → Get your key at: https://aistudio.google.com/app/apikey"
  echo "   → Action Lab won't work without it."
fi

# ─── Step 3: Start infrastructure ───────────────────────────────────────────
echo ""
echo "3️⃣  Starting PostgreSQL and Redis via Docker..."
docker compose up -d

echo "   Waiting for database to be ready..."
sleep 3

# Wait for postgres to be healthy
for i in {1..15}; do
  if docker exec unclinq_postgres pg_isready -U unclinq_user -d unclinq_dev &>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
    break
  fi
  if [ $i -eq 15 ]; then
    echo -e "${RED}✗ PostgreSQL didn't start in time. Check: docker logs unclinq_postgres${NC}"
    exit 1
  fi
  sleep 2
done

# Wait for redis
for i in {1..10}; do
  if docker exec unclinq_redis redis-cli ping &>/dev/null; then
    echo -e "${GREEN}✓ Redis is ready${NC}"
    break
  fi
  sleep 1
done

# ─── Step 4: Install backend deps ───────────────────────────────────────────
echo ""
echo "4️⃣  Installing backend dependencies..."
cd backend
npm install --silent
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# ─── Step 5: Run migrations ──────────────────────────────────────────────────
echo ""
echo "5️⃣  Running database migrations..."
node scripts/migrate.js
echo -e "${GREEN}✓ Database migrations complete${NC}"

cd ..

# ─── Step 6: Install frontend deps ──────────────────────────────────────────
echo ""
echo "6️⃣  Installing frontend dependencies..."
cd frontend
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

# ─── Done — Print next steps ─────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────────────────"
echo -e "${GREEN}✅  Everything is ready!${NC}"
echo ""
echo "Now open TWO terminal tabs and run:"
echo ""
echo "  Tab 1 — Backend:"
echo "    cd backend && npm run dev"
echo "    → API will run at http://localhost:3001"
echo ""
echo "  Tab 2 — Frontend:"
echo "    cd frontend && npm run dev"
echo "    → App will open at http://localhost:5173"
echo ""
echo "────────────────────────────────────────────────────"
