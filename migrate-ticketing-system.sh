#!/bin/bash

# Script to apply ticketing system database migrations

echo "🚀 Starting ticketing system migration..."

# Check if prisma is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js and npm first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with your database connection string."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "📄 Applying schema changes..."
npx prisma db push --accept-data-loss

echo "✅ Ticketing system migration completed!"
echo ""
echo "📋 What's been added:"
echo "  ✅ Ticket management system with categories and priorities"
echo "  ✅ Comment system for tickets with internal comments support"
echo "  ✅ File attachment support for tickets"
echo "  ✅ Activity logging for all ticket changes"
echo "  ✅ Enhanced notification system with targeting"
echo "  ✅ Notification recipient tracking"
echo ""
echo "🎯 You can now:"
echo "  • Create and manage support tickets"
echo "  • Add comments and attachments to tickets"
echo "  • Track ticket activities and changes"
echo "  • Send targeted notifications to employees"
echo "  • View notification delivery status"
