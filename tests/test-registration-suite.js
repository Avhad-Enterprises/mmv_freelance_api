#!/usr/bin/env node

/**
 * Complete Registration Test Suite
 * Runs all registration tests (Client, Video Editor, Videographer)
 * Provides comprehensive coverage of the registration system
 */

const { runCompleteRegistrationTests } = require('./test-client-registration-complete');
const { runCompleteVideoEditorTests } = require('./test-videoeditor-registration-complete');
const { runCompleteVideographerTests } = require('./test-videographer-registration-complete');

let totalPassedTests = 0;
let totalFailedTests = 0;

/**
 * Print overall test summary
 */
function printOverallSummary(suiteResults) {
  console.log('\n' + '='.repeat(60));
  console.log('🏆 OVERALL REGISTRATION TEST SUITE SUMMARY');
  console.log('='.repeat(60));
  
  suiteResults.forEach(result => {
    const status = result.failed === 0 ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.passed} passed, ${result.failed} failed`);
  });
  
  console.log('\n📊 TOTAL RESULTS:');
  console.log(`✅ Total Passed: ${totalPassedTests}`);
  console.log(`❌ Total Failed: ${totalFailedTests}`);
  console.log(`📈 Success Rate: ${((totalPassedTests / (totalPassedTests + totalFailedTests)) * 100).toFixed(1)}%`);
  
  if (totalFailedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Registration system is fully functional.');
  } else {
    console.log(`\n⚠️  ${totalFailedTests} test(s) failed. Please review the results above.`);
  }
  
  console.log('='.repeat(60));
}

/**
 * Run all registration test suites
 */
async function runAllRegistrationTests() {
  console.log('🚀 Starting Complete Registration Test Suite...\n');
  console.log('Testing: Client Registration, Video Editor Registration, Videographer Registration\n');
  
  const suiteResults = [];
  
  try {
    // Run Client Registration Tests
    console.log('📋 Running Client Registration Tests...');
    const clientResults = await runCompleteRegistrationTests();
    suiteResults.push({
      name: 'Client Registration',
      passed: clientResults.passedTests,
      failed: clientResults.failedTests
    });
    totalPassedTests += clientResults.passedTests;
    totalFailedTests += clientResults.failedTests;
    
    console.log('\n' + '-'.repeat(60) + '\n');
    
    // Run Video Editor Registration Tests
    console.log('🎬 Running Video Editor Registration Tests...');
    const videoEditorResults = await runCompleteVideoEditorTests();
    suiteResults.push({
      name: 'Video Editor Registration',
      passed: videoEditorResults.passedTests,
      failed: videoEditorResults.failedTests
    });
    totalPassedTests += videoEditorResults.passedTests;
    totalFailedTests += videoEditorResults.failedTests;
    
    console.log('\n' + '-'.repeat(60) + '\n');
    
    // Run Videographer Registration Tests
    console.log('📹 Running Videographer Registration Tests...');
    const videographerResults = await runCompleteVideographerTests();
    suiteResults.push({
      name: 'Videographer Registration',
      passed: videographerResults.passedTests,
      failed: videographerResults.failedTests
    });
    totalPassedTests += videographerResults.passedTests;
    totalFailedTests += videographerResults.failedTests;
    
    // Print overall summary
    printOverallSummary(suiteResults);
    
    // Exit with appropriate code
    process.exit(totalFailedTests > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllRegistrationTests().catch(error => {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllRegistrationTests };