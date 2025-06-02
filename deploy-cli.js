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
  
  // Check for changes
  const gitStatus = execSync('git status --porcelain').toString();
  
  if (gitStatus.length === 0) {
    console.log('ℹ️ No changes detected in the working directory.');
    console.log('🔄 Proceeding with deployment of current state...');
  } else {
    // Stage and commit changes
    console.log('📤 Staging changes...');
    execSync('git add .', { stdio: 'inherit' });
    
    console.log('💾 Committing changes...');
    try {
      execSync('git commit -m "Automated deployment"', { stdio: 'inherit' });
    } catch (commitError) {
      // If commit fails due to no changes, continue
      if (!commitError.message.includes('nothing to commit')) {
        throw commitError;
      }
    }
  }
  
  // Check if remote exists and handle pushing
  try {
    const remotes = execSync('git remote -v', { stdio: 'pipe' }).toString();
    if (!remotes.includes('origin')) {
      throw new Error('No remote repository configured');
    }
    
    console.log('🚀 Pushing to remote repository...');
    try {
      execSync('git push -u origin main', { stdio: 'inherit' });
    } catch (pushError) {
      if (pushError.message.includes('rejected')) {
        console.log('⚠️ Remote has changes. Pulling latest changes...');
        execSync('git pull origin main --rebase', { stdio: 'inherit' });
        execSync('git push -u origin main', { stdio: 'inherit' });
      } else {
        throw pushError;
      }
    }
  } catch (error) {
    if (error.message.includes('No remote repository configured')) {
      console.log('⚠️ No remote repository configured. Please add one with:');
      console.log('git remote add origin YOUR_GITHUB_REPO_URL');
      process.exit(1);
    }
    throw error;
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