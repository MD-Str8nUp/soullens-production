@echo off
echo Fixing Git repository for SoulLens.AI...

cd /d "C:\Users\Moey\Desktop\SoulLens.AI\CURRENT_PROJECT"

echo Removing large files from git tracking (keeping local files)...
git rm -r --cached node_modules/ 2>nul
git rm -r --cached .next/ 2>nul
git rm -r --cached .vercel/ 2>nul

echo Adding .gitignore...
git add .gitignore

echo Staging source files only...
git add src/
git add public/
git add package.json
git add package-lock.json
git add next.config.js
git add tailwind.config.js
git add postcss.config.js
git add jsconfig.json
git add README.md
git add vercel.json
git add .env.example

echo Committing clean version...
git commit -m "Clean repository - remove build files, keep source code"

echo Pushing to GitHub...
git push origin main --force

echo Done! Repository is now clean and ready for Vercel deployment.
pause