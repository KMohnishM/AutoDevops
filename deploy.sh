#!/bin/bash

echo "📦 Starting deployment process..."

# Check if git is initialized
if [ ! -d .git ]; then
  echo "🔧 Git repository not found. Initializing..."
  git init
fi

# Check if user is configured
if [ -z "$(git config user.email)" ]; then
  echo "⚠️ Git user not configured. Please run:"
  echo "git config --global user.email \"your@email.com\""
  echo "git config --global user.name \"Your Name\""
  exit 1
fi

# Check if it's a Next.js app (simplified check)
if grep -q "next" "package.json"; then
  APP_TYPE="Next.js"
else
  APP_TYPE="React"
fi
echo "📋 Detected $APP_TYPE application."

# Stage changes
echo "📤 Staging changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Automated deployment"

# Check if remote exists
if ! git remote -v | grep -q origin; then
  echo "⚠️ No remote repository configured. Please add one with:"
  echo "git remote add origin YOUR_GITHUB_REPO_URL"
  exit 1
fi

# Push changes
echo "🚀 Pushing to remote repository..."
git push -u origin main || git push -u origin master

echo "✨ Deployment triggered successfully!"
echo "🔍 GitHub Actions will now run the CI/CD pipeline."

if [ "$APP_TYPE" = "Next.js" ]; then
  echo "🌐 Your Next.js app will be deployed to Vercel."
else
  echo "☁️ Your React app will be deployed to AWS ECS."
fi