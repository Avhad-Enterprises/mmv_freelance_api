const { testCreateSkill } = require('./test-create-skill');
const { testGetAllSkills } = require('./test-get-all-skills');
const { testGetSkillById, testGetSkillByIdNotFound, testGetSkillByIdNoAuth } = require('./test-get-skill-by-id');
const { testUpdateSkill, testUpdateSkillNotFound, testUpdateSkillNoAuth, testUpdateSkillInvalidData } = require('./test-update-skill');
const { testDeleteSkill, testDeleteSkillNotFound, testDeleteSkillNoAuth, testSoftDeleteVerification } = require('./test-delete-skill');

/**
 * Run all skill API tests
 */
async function runAllSkillTests() {
  console.log('🚀 Starting Complete Skills API Test Suite');
  console.log('============================================');

  const results = [];
  let totalTests = 0;
  let passedTests = 0;

  try {
    // Test Create Skill
    console.log('\n📝 Running Create Skill Tests...');
    const createResult = await testCreateSkill();
    results.push({ suite: 'Create Skill', ...createResult });
    totalTests += 1;
    if (createResult.success) passedTests += 1;

    // Test Get All Skills
    console.log('\n📝 Running Get All Skills Tests...');
    const getAllResult = await testGetAllSkills();
    results.push({ suite: 'Get All Skills', ...getAllResult });
    totalTests += 1;
    if (getAllResult.success) passedTests += 1;

    // Test Get Skill by ID - Success
    console.log('\n📝 Running Get Skill by ID Tests...');
    const getByIdResult = await testGetSkillById();
    results.push({ suite: 'Get Skill by ID - Success', ...getByIdResult });
    totalTests += 1;
    if (getByIdResult.success) passedTests += 1;

    // Test Get Skill by ID - Not Found
    const getByIdNotFoundResult = await testGetSkillByIdNotFound();
    results.push({ suite: 'Get Skill by ID - Not Found', ...getByIdNotFoundResult });
    totalTests += 1;
    if (getByIdNotFoundResult.success) passedTests += 1;

    // Test Get Skill by ID - No Auth
    const getByIdNoAuthResult = await testGetSkillByIdNoAuth();
    results.push({ suite: 'Get Skill by ID - No Auth', ...getByIdNoAuthResult });
    totalTests += 1;
    if (getByIdNoAuthResult.success) passedTests += 1;

    // Test Update Skill - Success
    console.log('\n📝 Running Update Skill Tests...');
    const updateResult = await testUpdateSkill();
    results.push({ suite: 'Update Skill - Success', ...updateResult });
    totalTests += 1;
    if (updateResult.success) passedTests += 1;

    // Test Update Skill - Not Found
    const updateNotFoundResult = await testUpdateSkillNotFound();
    results.push({ suite: 'Update Skill - Not Found', ...updateNotFoundResult });
    totalTests += 1;
    if (updateNotFoundResult.success) passedTests += 1;

    // Test Update Skill - No Auth
    const updateNoAuthResult = await testUpdateSkillNoAuth();
    results.push({ suite: 'Update Skill - No Auth', ...updateNoAuthResult });
    totalTests += 1;
    if (updateNoAuthResult.success) passedTests += 1;

    // Test Update Skill - Invalid Data
    const updateInvalidResult = await testUpdateSkillInvalidData();
    results.push({ suite: 'Update Skill - Invalid Data', ...updateInvalidResult });
    totalTests += 1;
    if (updateInvalidResult.success) passedTests += 1;

    // Test Delete Skill - Success
    console.log('\n📝 Running Delete Skill Tests...');
    const deleteResult = await testDeleteSkill();
    results.push({ suite: 'Delete Skill - Success', ...deleteResult });
    totalTests += 1;
    if (deleteResult.success) passedTests += 1;

    // Test Delete Skill - Not Found
    const deleteNotFoundResult = await testDeleteSkillNotFound();
    results.push({ suite: 'Delete Skill - Not Found', ...deleteNotFoundResult });
    totalTests += 1;
    if (deleteNotFoundResult.success) passedTests += 1;

    // Test Delete Skill - No Auth
    const deleteNoAuthResult = await testDeleteSkillNoAuth();
    results.push({ suite: 'Delete Skill - No Auth', ...deleteNoAuthResult });
    totalTests += 1;
    if (deleteNoAuthResult.success) passedTests += 1;

    // Test Soft Delete Verification
    const softDeleteResult = await testSoftDeleteVerification();
    results.push({ suite: 'Soft Delete Verification', ...softDeleteResult });
    totalTests += 1;
    if (softDeleteResult.success) passedTests += 1;

  } catch (error) {
    console.error(`💥 ERROR during test execution: ${error.message}`);
    results.push({ suite: 'Test Execution Error', success: false, error: error.message });
  }

  // Summary
  console.log('\n📊 Complete Skills API Test Suite Results:');
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.suite}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n📈 Final Results: ${passedTests}/${totalTests} test suites passed`);

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`📊 Success Rate: ${successRate}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL SKILLS API TESTS PASSED! 🎉');
    console.log('✅ Skills feature is fully functional and tested');
    process.exit(0);
  } else {
    console.log('\n💥 SOME SKILLS API TESTS FAILED');
    console.log('❌ Please review the failed tests above');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllSkillTests();
}

module.exports = { runAllSkillTests };