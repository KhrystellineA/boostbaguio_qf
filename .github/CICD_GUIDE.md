# CI/CD Setup Guide

## Overview

This project uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD).

---

## Workflow Pipeline

### **On Every Push/Pull Request:**

1. **Lint** → ESLint + Prettier check
2. **Test** → Run all tests with coverage
3. **Build** → Build production bundle
4. **Deploy** → Deploy to Vercel (main branch only)

---

## Workflow Stages

### **1. Lint Stage**

```yaml
- Checkout code
- Setup pnpm + Node.js
- Install dependencies
- Run ESLint
- Check Prettier formatting
```

**Fails if:**

- ESLint errors found
- Code not formatted properly

### **2. Test Stage**

```yaml
- Checkout code
- Setup pnpm + Node.js
- Install dependencies
- Run tests (vitest)
- Generate coverage report
- Upload coverage artifact
```

**Fails if:**

- Any test fails
- Coverage below threshold

### **3. Build Stage**

```yaml
- Checkout code
- Setup pnpm + Node.js
- Install dependencies
- Build application (quasar build)
- Upload dist artifact
- Analyze bundle size
```

**Fails if:**

- Build fails
- Critical errors in compilation

### **4. Deploy Stage** (Main branch only)

```yaml
- Checkout code
- Setup pnpm + Node.js
- Install dependencies
- Build application
- Deploy to Vercel (production)
- Deploy to Firebase Hosting (optional)
```

**Deploys when:**

- All previous stages pass
- Push to main branch

---

## Setup Instructions

### **1. GitHub Secrets**

Go to: `GitHub Repo → Settings → Secrets and variables → Actions`

Add these secrets:

#### **Vercel Deployment:**

```
VERCEL_TOKEN        # Vercel API token
VERCEL_ORG_ID       # Vercel organization ID
VERCEL_PROJECT_ID   # Vercel project ID
```

#### **Firebase Deployment (Optional):**

```
FIREBASE_SERVICE_ACCOUNT  # Firebase service account JSON
```

### **2. Get Vercel Credentials**

1. **VERCEL_TOKEN:**
   - Go to https://vercel.com/account/tokens
   - Create new token
   - Copy token

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID:**
   - Go to Vercel Dashboard
   - Select your project
   - Click "Settings" → "General"
   - Find "Project ID" and "Org ID"

### **3. Get Firebase Credentials**

1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key
4. Save JSON content
5. Add to GitHub Secrets as `FIREBASE_SERVICE_ACCOUNT`

---

## Manual Workflow Triggers

### **Run Tests Manually:**

```bash
pnpm test:run
```

### **Build Locally:**

```bash
pnpm build
```

### **Check Lint:**

```bash
pnpm lint
pnpm format:check
```

---

## Workflow Status

### **View Workflow Runs:**

- Go to: `GitHub Repo → Actions`
- See all workflow runs
- Check logs for each job

### **Badges:**

Add to README.md:

```markdown
[![CI/CD](https://github.com/yourusername/boostbaguio_qf/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/boostbaguio_qf/actions/workflows/ci.yml)
```

---

## Troubleshooting

### **Workflow Fails at Lint:**

```bash
# Fix linting issues
pnpm lint:fix
pnpm format

# Commit changes
git add .
git commit -m "fix: resolve linting issues"
git push
```

### **Workflow Fails at Test:**

```bash
# Run tests locally
pnpm test:run

# Fix failing tests
# Commit changes
git push
```

### **Workflow Fails at Build:**

```bash
# Build locally
pnpm build

# Check for errors
# Fix build issues
git push
```

### **Deployment Fails:**

1. Check Vercel dashboard for errors
2. Verify secrets are correct
3. Check build logs
4. Retry deployment

---

## Branch Protection

### **Recommended Settings:**

Go to: `Settings → Branches → Add branch protection rule`

**Branch name pattern:** `main`

**Protect:**

- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators

**Status checks:**

- ✅ lint
- ✅ test
- ✅ build

---

## Deployment Environments

### **Production (Main)**

- **Branch:** `main`
- **Deploy to:** Vercel Production
- **Trigger:** Push to main
- **Requirements:** All tests pass

### **Staging (Develop)**

- **Branch:** `develop` (optional)
- **Deploy to:** Vercel Preview
- **Trigger:** Push to develop
- **Requirements:** Tests pass

### **Preview (Pull Requests)**

- **Branch:** Feature branches
- **Deploy to:** Vercel Preview URL
- **Trigger:** Pull request
- **Requirements:** None (optional)

---

## Cost Optimization

### **GitHub Actions Minutes:**

- Free tier: 2,000 minutes/month
- Optimize by:
  - Caching dependencies (pnpm cache)
  - Running on latest Ubuntu
  - Canceling redundant workflows

### **Vercel Deployments:**

- Free tier: Unlimited preview deployments
- Production deployments: Included
- Bandwidth: 100GB/month (free)

---

## Security Best Practices

1. **Never commit secrets**
   - Use GitHub Secrets
   - Add to `.gitignore`

2. **Use least privilege**
   - Limit token permissions
   - Use project-specific tokens

3. **Rotate secrets regularly**
   - Update tokens every 90 days
   - Revoke unused tokens

4. **Protect main branch**
   - Require PR reviews
   - Require status checks
   - Disable force pushes

---

## Monitoring

### **Check Workflow Health:**

- Monitor failed runs
- Check execution time
- Review test coverage trends

### **Alerts:**

- Set up email notifications
- Use GitHub mobile app
- Integrate with Slack/Discord

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git)
- [Firebase GitHub Actions](https://github.com/FirebaseExtended/action-hosting-deploy)
- [pnpm GitHub Actions](https://github.com/pnpm/action-setup)

---

## Support

For CI/CD issues:

1. Check workflow logs
2. Review this guide
3. Check GitHub Status
4. Ask in team channels
