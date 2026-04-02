#!/bin/bash
set -e

echo "==> Installing dependencies..."
npm install --legacy-peer-deps

echo "==> Pushing Prisma schema..."
npx prisma db push --accept-data-loss

echo "==> Post-merge setup complete."
