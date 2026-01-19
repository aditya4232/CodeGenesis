#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Checks if CodeGenesis is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend');
const ENV_FILE = path.join(FRONTEND_DIR, '.env.local');

console.log('🔍 CodeGenesis Pre-Deployment Verification\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment Variables
console.log('1️⃣  Checking environment variables...');
if (!fs.existsSync(ENV_FILE)) {
    console.error('   ❌ .env.local not found!');
    hasErrors = true;
} else {
    const envContent = fs.readFileSync(ENV_FILE, 'utf-8');

    const requiredVars = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'API_KEY_ENCRYPTION_SECRET',
        'CRON_SECRET'
    ];

    const missingVars = requiredVars.filter(v => !envContent.includes(v));

    if (missingVars.length > 0) {
        console.error(`   ❌ Missing variables: ${missingVars.join(', ')}`);
        hasErrors = true;
    } else {
        console.log('   ✅ All required variables present');
    }

    // Check for weak secrets
    if (envContent.includes('CHANGE_THIS') || envContent.includes('change-in-production')) {
        console.warn('   ⚠️  WARNING: Using development secrets! Generate new ones for production.');
        hasWarnings = true;
    }

    // Check for test keys
    if (envContent.includes('pk_test_') || envContent.includes('sk_test_')) {
        console.warn('   ⚠️  WARNING: Using Clerk TEST keys! Switch to production keys.');
        hasWarnings = true;
    }
}

// Check 2: Build Files
console.log('\n2️⃣  Checking critical files...');
const criticalFiles = [
    'frontend/next.config.ts',
    'frontend/middleware.ts',
    'frontend/package.json',
    'vercel.json',
    'frontend/supabase/schema_agent_conversations.sql'
];

criticalFiles.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, file))) {
        console.error(`   ❌ Missing: ${file}`);
        hasErrors = true;
    }
});

if (!hasErrors) {
    console.log('   ✅ All critical files present');
}

// Check 3: Next.js Config
console.log('\n3️⃣  Checking Next.js configuration...');
const nextConfig = fs.readFileSync(path.join(FRONTEND_DIR, 'next.config.ts'), 'utf-8');

if (nextConfig.includes('localhost') && !nextConfig.includes("process.env.NODE_ENV === 'development'")) {
    console.warn('   ⚠️  WARNING: Localhost references in config without environment check');
    hasWarnings = true;
} else {
    console.log('   ✅ Next.js config looks good');
}

// Check 4: Middleware
console.log('\n4️⃣  Checking middleware...');
const middleware = fs.readFileSync(path.join(FRONTEND_DIR, 'middleware.ts'), 'utf-8');

if (middleware.includes('auth.protect()') && !middleware.includes('auth().protect()')) {
    console.error('   ❌ Middleware using deprecated Clerk API');
    hasErrors = true;
} else {
    console.log('   ✅ Middleware updated for Clerk v5');
}

// Check 5: Package.json
console.log('\n5️⃣  Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(FRONTEND_DIR, 'package.json'), 'utf-8'));

const requiredDeps = [
    '@clerk/nextjs',
    '@supabase/supabase-js',
    'next',
    'react',
    'react-dom'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
    console.error(`   ❌ Missing dependencies: ${missingDeps.join(', ')}`);
    hasErrors = true;
} else {
    console.log('   ✅ All required dependencies installed');
}

// Check 6: Vercel Config
console.log('\n6️⃣  Checking Vercel configuration...');
const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf-8'));

if (!vercelConfig.crons || vercelConfig.crons.length === 0) {
    console.warn('   ⚠️  WARNING: No cron jobs configured');
    hasWarnings = true;
} else {
    console.log('   ✅ Cron job configured for cleanup');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY\n');

if (hasErrors) {
    console.error('❌ FAILED: Fix errors before deploying!');
    process.exit(1);
} else if (hasWarnings) {
    console.warn('⚠️  WARNINGS: Review warnings before deploying');
    console.log('\n✅ Build is functional but has warnings');
    console.log('   Recommended: Address warnings for production');
} else {
    console.log('✅ ALL CHECKS PASSED!');
    console.log('   Your project is ready for deployment! 🚀');
}

console.log('\n📝 Next Steps:');
console.log('   1. Review PRODUCTION_READY.md');
console.log('   2. Update environment variables for production');
console.log('   3. Deploy to Vercel');
console.log('   4. Run database schema in Supabase');
console.log('   5. Test all features in production');

console.log('\n' + '='.repeat(50));
