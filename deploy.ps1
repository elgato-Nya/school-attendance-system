# Firebase Deployment Script for School Attendance System
# This script automates the build and deployment process

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  School Attendance System Deployment  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
Write-Host ""

# Check if logged in to Firebase
Write-Host "Checking Firebase authentication..." -ForegroundColor Yellow
firebase projects:list >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Firebase" -ForegroundColor Yellow
    Write-Host "Running firebase login..." -ForegroundColor Yellow
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Firebase login failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Firebase authenticated" -ForegroundColor Green
Write-Host ""

# Check if .env.production exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.production")) {
    Write-Host "⚠️  .env.production not found!" -ForegroundColor Yellow
    Write-Host "Creating template .env.production file..." -ForegroundColor Yellow
    @"
# Firebase Configuration for Production
# Get these values from: Firebase Console > Project Settings > General

VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
"@ | Out-File -FilePath ".env.production" -Encoding UTF8
    
    Write-Host "📝 Please edit .env.production with your Firebase credentials" -ForegroundColor Yellow
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    exit 0
}
Write-Host "✅ Environment configuration found" -ForegroundColor Green
Write-Host ""

# Confirm deployment
Write-Host "Ready to deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Install dependencies" -ForegroundColor Gray
Write-Host "  2. Build production bundle" -ForegroundColor Gray
Write-Host "  3. Deploy to Firebase Hosting" -ForegroundColor Gray
Write-Host ""
$confirm = Read-Host "Continue? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build production bundle
Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "Check the error messages above and fix any issues." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Check if firebase.json exists
if (-not (Test-Path "firebase.json")) {
    Write-Host "⚠️  firebase.json not found!" -ForegroundColor Yellow
    Write-Host "Run 'firebase init' first to set up Firebase in this project." -ForegroundColor Yellow
    exit 1
}

# Deploy to Firebase
Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Deployment Successful!            " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now live! 🎉" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  • Open your app: firebase open hosting:site" -ForegroundColor Gray
Write-Host "  • Create admin account (see FIREBASE_HOSTING_GUIDE.md)" -ForegroundColor Gray
Write-Host "  • Monitor usage: Firebase Console > Usage tab" -ForegroundColor Gray
Write-Host ""
Write-Host "For help, see: FIREBASE_HOSTING_GUIDE.md" -ForegroundColor Yellow
