#!/usr/bin/env ts-node
/**
 * Database Connection Test Script
 * Tests basic connection to PostgreSQL database
 *
 * Usage: npm run test:db
 * Or: ts-node scripts/test-db-connection.ts
 */

import DB from '../database/index.schema';
import dotenv from 'dotenv';

dotenv.config();

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

/**
 * Add test result
 */
function addResult(test: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
  results.push({ test, status, message, details });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

/**
 * Test 1: Basic Connection
 */
async function testConnection() {
  try {
    await DB.raw('SELECT 1 as test');
    addResult('Connection Test', 'PASS', 'Database connection successful');
    return true;
  } catch (error: any) {
    addResult('Connection Test', 'FAIL', `Connection failed: ${error.message}`);
    return false;
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log('\n🧪 Database Connection Test\n');
  console.log('='.repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_DATABASE}`);
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log('='.repeat(60));
  console.log('\n');

  const tests = [
    { name: 'Connection Test', fn: testConnection }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('\n' + '='.repeat(60));

  // Close database connection
  await DB.destroy();

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite crashed:', error.message);
  console.error(error.stack);
  DB.destroy().then(() => process.exit(1));
});
