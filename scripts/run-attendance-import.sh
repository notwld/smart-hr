#!/bin/bash

echo "🚀 Starting HR Attendance Data Import..."
echo "⚠️  Make sure your database is running and accessible!"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the TypeScript script
echo "🔄 Running attendance import script..."
npx tsx scripts/import-attendance-data.ts

echo ""
echo "✅ Import script completed!"
echo "Check the output above for results and any errors." 