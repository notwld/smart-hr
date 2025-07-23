#!/usr/bin/env node

/**
 * Debug script to help troubleshoot NextAuth authentication issues
 * Run with: node scripts/debug-auth.js
 */

const https = require('https');
const http = require('http');

console.log('🔍 NextAuth Authentication Debug Tool\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'undefined');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '[SET]' : 'undefined');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : 'undefined');
console.log('VERCEL_URL:', process.env.VERCEL_URL || 'undefined');
console.log('COOKIE_DOMAIN:', process.env.COOKIE_DOMAIN || 'undefined');
console.log('');

// Validation checks
const issues = [];

if (!process.env.NEXTAUTH_URL) {
  issues.push('❌ NEXTAUTH_URL is not set');
} else {
  console.log('✅ NEXTAUTH_URL is set');
  
  // Validate URL format
  try {
    const url = new URL(process.env.NEXTAUTH_URL);
    if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      issues.push('⚠️  NEXTAUTH_URL should use HTTPS in production');
    }
  } catch (e) {
    issues.push('❌ NEXTAUTH_URL is not a valid URL');
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  issues.push('❌ NEXTAUTH_SECRET is not set');
} else if (process.env.NEXTAUTH_SECRET.length < 32) {
  issues.push('⚠️  NEXTAUTH_SECRET should be at least 32 characters long');
} else {
  console.log('✅ NEXTAUTH_SECRET is set and has good length');
}

if (!process.env.DATABASE_URL) {
  issues.push('❌ DATABASE_URL is not set');
} else {
  console.log('✅ DATABASE_URL is set');
}

// Environment-specific checks
if (process.env.NODE_ENV === 'production') {
  console.log('\n🚀 Production Environment Checks:');
  
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('https://')) {
    issues.push('❌ Production NEXTAUTH_URL must use HTTPS');
  }
  
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sslmode=require')) {
    issues.push('⚠️  Consider adding sslmode=require to DATABASE_URL for production');
  }
}

// Test API endpoint if NEXTAUTH_URL is available
if (process.env.NEXTAUTH_URL) {
  console.log('\n🌐 Testing API Endpoints:');
  
  const baseUrl = process.env.NEXTAUTH_URL;
  const testEndpoints = [
    '/api/auth/session',
    '/api/auth/providers',
    '/api/auth/csrf'
  ];
  
  testEndpoints.forEach(endpoint => {
    const url = baseUrl + endpoint;
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${endpoint} - Status: ${res.statusCode}`);
      } else {
        console.log(`❌ ${endpoint} - Status: ${res.statusCode}`);
        issues.push(`API endpoint ${endpoint} returned ${res.statusCode}`);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
      issues.push(`Cannot reach ${endpoint}: ${error.message}`);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${endpoint} - Timeout`);
      issues.push(`Timeout reaching ${endpoint}`);
      req.destroy();
    });
  });
  
  // Give time for requests to complete
  setTimeout(() => {
    printSummary();
  }, 6000);
} else {
  printSummary();
}

function printSummary() {
  console.log('\n📊 Summary:');
  
  if (issues.length === 0) {
    console.log('🎉 No issues found! Your authentication should work.');
  } else {
    console.log(`❌ Found ${issues.length} issue(s):`);
    issues.forEach(issue => console.log(`   ${issue}`));
    
    console.log('\n🔧 Suggested fixes:');
    console.log('1. Set missing environment variables in your deployment platform');
    console.log('2. Generate a secure NEXTAUTH_SECRET: openssl rand -base64 32');
    console.log('3. Ensure NEXTAUTH_URL matches your production domain');
    console.log('4. Enable HTTPS for production deployments');
    console.log('5. Check database connectivity and SSL settings');
  }
  
  console.log('\n📚 For more help, see: DEPLOYMENT_GUIDE.md');
  process.exit(issues.length > 0 ? 1 : 0);
} 