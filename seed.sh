#!/bin/bash

echo "🌱 Seeding database with test data..."
echo

# Change to the project directory
cd "$(dirname "$0")"

# Run the seeding script
go run backend/cmd/seed/main.go

echo
echo "✅ Seeding completed!"
echo
echo "🔑 You can now login with:"
echo "   Username: nono"
echo "   Email: nono@gmail.com"
echo "   Password: 1234"
echo
echo "👥 Other test users: alice, bob, charlie, diana, ethan, fiona, george"
echo "   All with password: 1234"