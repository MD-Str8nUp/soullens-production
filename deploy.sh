#!/bin/bash

echo "🚀 SoulLens AI - Production Deployment Script"
echo "============================================="

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Build the application
echo "🔨 Building application..."
npm run build

# Step 3: Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up custom domain in Vercel dashboard"
echo "2. Configure DNS settings for mysoullens.com"
echo "3. Add environment variables in Vercel"
echo "4. Test all API endpoints"
echo ""
echo "🌟 Your SoulLens AI app is live!"