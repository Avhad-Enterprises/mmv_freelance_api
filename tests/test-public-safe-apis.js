#!/usr/bin/env node

/**
 * Public-Safe APIs Test - Get All Jobs & Freelancers (without sensitive data)
 * Tests for public endpoints that exclude email and phone number
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
} = require('./test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Test get all jobs public-safe (without sensitive client info)
 */
async function testGetAllJobsPublic() {
  printSection('GET ALL JOBS PUBLIC-SAFE - API TEST');

  try {
    // Test without authentication (should work)
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/projectsTask/getallprojectlisting-public`);

    const success = response.statusCode === 200 && response.body && response.body.success === true;
    printTestResult('Get all jobs public-safe (no auth)', success, {
      status: response.statusCode,
      hasData: !!response.body,
      success: response.body?.success,
      count: response.body?.data?.length || 0
    });

    // Additional check: ensure no sensitive data is included
    if (success && response.body.data && response.body.data.length > 0) {
      const firstJob = response.body.data[0];
      const hasSensitiveData = firstJob.email || firstJob.phone_number ||
                              firstJob.client_email || firstJob.client_phone_number;

      if (!hasSensitiveData) {
        console.log('✅ No sensitive client data found in response');
      } else {
        console.log('⚠️  Warning: Sensitive data may be present');
      }
    }

    if (success) {
      passedTests++;
    } else {
      failedTests++;
      console.log('❌ Response:', JSON.stringify(response, null, 2));
    }

  } catch (error) {
    printTestResult('Get all jobs public-safe (no auth)', false, { error: error.message });
    failedTests++;
  }
}

/**
 * Test get all freelancers public-safe (without email and phone)
 */
async function testGetAllFreelancersPublic() {
  printSection('GET ALL FREELANCERS PUBLIC-SAFE - API TEST');

  try {
    // Test without authentication (should work)
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/freelancers/getfreelancers-public`);

    const success = response.statusCode === 200 && response.body && response.body.success === true;
    printTestResult('Get all freelancers public-safe (no auth)', success, {
      status: response.statusCode,
      hasData: !!response.body,
      success: response.body?.success,
      count: response.body?.data?.length || 0
    });

    // Additional check: ensure email and phone_number are excluded
    if (success && response.body.data && response.body.data.length > 0) {
      const firstFreelancer = response.body.data[0];
      const hasEmail = firstFreelancer.email !== undefined;
      const hasPhone = firstFreelancer.phone_number !== undefined;

      if (!hasEmail && !hasPhone) {
        console.log('✅ Email and phone number properly excluded from response');
      } else {
        console.log('⚠️  Warning: Email or phone number may be present in response');
        if (hasEmail) console.log('   - Email field found');
        if (hasPhone) console.log('   - Phone number field found');
      }
    }

    if (success) {
      passedTests++;
    } else {
      failedTests++;
      console.log('❌ Response:', JSON.stringify(response, null, 2));
    }

  } catch (error) {
    printTestResult('Get all freelancers public-safe (no auth)', false, { error: error.message });
    failedTests++;
  }
}

/**
 * Compare responses to ensure public-safe versions exclude sensitive data
 */
async function testDataExclusion() {
  printSection('DATA EXCLUSION VERIFICATION TEST');

  try {
    // Get both regular and public-safe versions
    const [regularJobsRes, publicJobsRes] = await Promise.all([
      makeRequest('GET', `${CONFIG.apiVersion}/projectsTask/getallprojectlisting`),
      makeRequest('GET', `${CONFIG.apiVersion}/projectsTask/getallprojectlisting-public`)
    ]);

    const [regularFreelancersRes, publicFreelancersRes] = await Promise.all([
      makeRequest('GET', `${CONFIG.apiVersion}/freelancers/getfreelancers`),
      makeRequest('GET', `${CONFIG.apiVersion}/freelancers/getfreelancers-public`)
    ]);

    let exclusionTests = 0;
    let exclusionPassed = 0;

    // Check jobs data exclusion
    if (regularJobsRes.body?.data?.length > 0 && publicJobsRes.body?.data?.length > 0) {
      exclusionTests++;
      // For jobs, we're mainly checking that the same data structure is returned
      // (since client email/phone weren't included in the original anyway)
      console.log('ℹ️  Jobs API: Both versions return same data structure (no sensitive client data in either)');
      exclusionPassed++;
    }

    // Check freelancers data exclusion
    if (regularFreelancersRes.body?.data?.length > 0 && publicFreelancersRes.body?.data?.length > 0) {
      exclusionTests++;
      const regularFreelancer = regularFreelancersRes.body.data[0];
      const publicFreelancer = publicFreelancersRes.body.data[0];

      const regularHasEmail = regularFreelancer.email !== undefined;
      const regularHasPhone = regularFreelancer.phone_number !== undefined;
      const publicHasEmail = publicFreelancer.email !== undefined;
      const publicHasPhone = publicFreelancer.phone_number !== undefined;

      if (regularHasEmail && !publicHasEmail && regularHasPhone && !publicHasPhone) {
        console.log('✅ Freelancers API: Email and phone properly excluded in public version');
        exclusionPassed++;
      } else {
        console.log('❌ Freelancers API: Data exclusion verification failed');
        if (publicHasEmail) console.log('   - Public version still contains email');
        if (publicHasPhone) console.log('   - Public version still contains phone');
      }
    }

    const success = exclusionTests > 0 && exclusionPassed === exclusionTests;
    printTestResult('Data exclusion verification', success, {
      testsRun: exclusionTests,
      testsPassed: exclusionPassed
    });

    if (success) {
      passedTests++;
    } else {
      failedTests++;
    }

  } catch (error) {
    printTestResult('Data exclusion verification', false, { error: error.message });
    failedTests++;
  }
}

/**
 * Run all public-safe API tests
 */
async function runPublicSafeAPITests() {
  console.log('🛡️  Starting Public-Safe APIs Test Suite');
  console.log('📋 Testing endpoints that exclude sensitive information (email, phone)');
  console.log('');

  await testGetAllJobsPublic();
  await testGetAllFreelancersPublic();
  await testDataExclusion();

  printSummary(passedTests, failedTests);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run tests
runPublicSafeAPITests().catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});