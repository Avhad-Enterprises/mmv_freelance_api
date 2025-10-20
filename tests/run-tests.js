#!/usr/bin/env node

/**
 * Test Runner Script
 * 
 * This script runs both login and registration test suites
 * 
 * Usage: 
 *   node tests/run-tests.js           # Run all tests
 *   node tests/run-tests.js login     # Run only login tests
 *   node tests/run-tests.js register  # Run only registration tests
 */

const { spawn } = require('child_process');
const path = require('path');

const SCRIPTS = {
  login: 'auth/test-login.js',
  register: 'auth/test-register.js',
  faq: 'faq/run-faq-tests.js'
};

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, SCRIPTS[scriptName]);
    
    console.log(`\n🚀 Running ${scriptName} tests...`);
    console.log(`Script: ${scriptPath}`);
    console.log('='.repeat(50));
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${scriptName} tests completed successfully`);
        resolve({ script: scriptName, success: true, code });
      } else {
        console.log(`\n❌ ${scriptName} tests failed with exit code ${code}`);
        resolve({ script: scriptName, success: false, code });
      }
    });
    
    child.on('error', (error) => {
      console.error(`\n💥 Error running ${scriptName} tests:`, error);
      reject({ script: scriptName, error });
    });
  });
}

async function runAllTests() {
  const args = process.argv.slice(2);
  const testType = args[0];
  
  console.log('🧪 MMV Freelance API Test Suite');
  console.log('================================');
  console.log(`Node.js Version: ${process.version}`);
  console.log(`Working Directory: ${process.cwd()}`);
  console.log('');
  
  // Validate test type
  if (testType && !SCRIPTS[testType]) {
    console.error(`❌ Invalid test type: ${testType}`);
    console.error(`Available options: ${Object.keys(SCRIPTS).join(', ')}`);
    process.exit(1);
  }
  
  const results = [];
  
  try {
    if (testType) {
      // Run specific test
      const result = await runScript(testType);
      results.push(result);
    } else {
      // Run all tests
      console.log('Running all test suites...\n');
      
      // Run login tests first
      const loginResult = await runScript('login');
      results.push(loginResult);
      
      console.log('\n' + '='.repeat(80) + '\n');
      
      // Run registration tests
      const registerResult = await runScript('register');
      results.push(registerResult);

      console.log('\n' + '='.repeat(80) + '\n');
      
      // Run FAQ tests
      const faqResult = await runScript('faq');
      results.push(faqResult);
    }
    
    // Print final summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL TEST SUMMARY');
    console.log('='.repeat(80));
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    results.forEach(result => {
      const status = result.success ? '✅ PASSED' : '❌ FAILED';
      const exitCode = result.success ? '' : ` (exit code: ${result.code})`;
      console.log(`${result.script.toUpperCase()} TESTS: ${status}${exitCode}`);
    });
    
    console.log('\n' + '-'.repeat(40));
    console.log(`Total Test Suites: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n⚠️  Some test suites failed. Check the output above for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All test suites passed!');
    }
    
  } catch (error) {
    console.error('\n💥 Test runner error:', error);
    process.exit(1);
  }
}

// Usage information
function showUsage() {
  console.log('Usage:');
  console.log('  node tests/run-tests.js           # Run all tests');
  console.log('  node tests/run-tests.js login     # Run only login tests');
  console.log('  node tests/run-tests.js register  # Run only registration tests');
  console.log('  node tests/run-tests.js faq       # Run only FAQ tests');
  console.log('');
  console.log('Available test suites:');
  Object.keys(SCRIPTS).forEach(script => {
    console.log(`  - ${script}`);
  });
}

// Handle help flags
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run tests
if (require.main === module) {
  runAllTests();
}