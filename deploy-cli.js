#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple version of the deploy CLI
console.log('📦 Starting deployment process...');

try {
  // Check if git is initialized
  if (!fs.existsSync('.git')) {
    console.log('🔧 Git repository not found. Initializing...');
    execSync('git init', { stdio: 'inherit' });
  }
  
  // Determine if it's a Next.js or React app
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const isNextJs = packageJson.dependencies && packageJson.dependencies.next;
  
  console.log(`📋 Detected ${isNextJs ? 'Next.js' : 'React'} application.`);
  
  // Stage, commit and push changes
  console.log('📤 Staging changes...');
  execSync('git add .', { stdio: 'inherit' });
  
  console.log('💾 Committing changes...');
  execSync('git commit -m "Automated deployment"', { stdio: 'inherit' });
  
  // Check if remote exists before pushing
  try {
    execSync('git remote -v', { stdio: 'pipe' });
    console.log('🚀 Pushing to remote repository...');
    execSync('git push -u origin main', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ No remote repository configured. Please add one with:');
    console.log('git remote add origin YOUR_GITHUB_REPO_URL');
    process.exit(1);
  }
  
  console.log('✨ Deployment triggered successfully!');
  console.log('🔍 GitHub Actions will now run the CI/CD pipeline.');
  
  if (isNextJs) {
    console.log('🌐 Your Next.js app will be deployed to Vercel.');
  } else {
    console.log('☁️ Your React app will be deployed to AWS ECS.');
  }
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 