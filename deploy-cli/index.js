#!/usr/bin/env node

const { program } = require('commander');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

program
  .version('1.0.0')
  .description('One-click deployment for Next.js/React apps');

program
  .command('deploy')
  .description('Deploy the application')
  .option('-m, --message <message>', 'Commit message', 'Automated deployment')
  .action(async (options) => {
    try {
      console.log('📦 Starting deployment process...');
      
      // Check if git is initialized
      if (!fs.existsSync('.git')) {
        console.log('🔧 Git repository not found. Initializing...');
        execSync('git init', { stdio: 'inherit' });
      }
      
      // Check if remote exists
      try {
        execSync('git remote -v', { stdio: 'pipe' });
      } catch (error) {
        const { remoteUrl } = await inquirer.prompt([
          {
            type: 'input',
            name: 'remoteUrl',
            message: 'Enter your GitHub repository URL:',
            validate: input => input.trim() !== '' ? true : 'Repository URL is required'
          }
        ]);
        
        execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
        console.log('✅ Remote repository configured.');
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
      execSync(`git commit -m "${options.message}"`, { stdio: 'inherit' });
      
      console.log('🚀 Pushing to remote repository...');
      execSync('git push -u origin main', { stdio: 'inherit' });
      
      console.log('✨ Deployment triggered successfully!');
      console.log('🔍 GitHub Actions will now run the CI/CD pipeline.');
      console.log('⏳ You can check the progress in the Actions tab of your GitHub repository.');
      
      if (isNextJs) {
        console.log('🌐 Your Next.js app will be deployed to Vercel.');
      } else {
        console.log('☁️ Your React app will be deployed to AWS ECS.');
      }
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize deployment configuration')
  .action(async () => {
    try {
      console.log('🔧 Initializing deployment configuration...');
      
      const { projectType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'projectType',
          message: 'Select your project type:',
          choices: ['Next.js', 'React']
        }
      ]);
      
      if (projectType === 'Next.js') {
        // Create Next.js app
        console.log('📦 Creating Next.js application...');
        execSync('npx create-next-app@latest . --use-npm --eslint --app --src-dir --import-alias "@/*"', { stdio: 'inherit' });
        
        // Install required packages
        console.log('📦 Installing security packages...');
        execSync('npm install next-auth @sentry/nextjs', { stdio: 'inherit' });
      } else {
        // Create React app
        console.log('📦 Creating React application...');
        execSync('npx create-react-app .', { stdio: 'inherit' });
        
        // Install required packages
        console.log('📦 Installing security packages...');
        execSync('npm install @sentry/react', { stdio: 'inherit' });
      }
      
      // Create GitHub workflow directory and files
      const workflowDir = path.join(process.cwd(), '.github/workflows');
      if (!fs.existsSync(workflowDir)) {
        fs.mkdirSync(workflowDir, { recursive: true });
      }
      
      // Copy workflow file
      fs.copyFileSync(
        path.join(__dirname, '../templates/ci-cd.yml'),
        path.join(workflowDir, 'ci-cd.yml')
      );
      
      console.log('✅ Deployment configuration initialized successfully!');
      console.log('🚀 You can now use `deploy-cli deploy` to deploy your application.');
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv); 