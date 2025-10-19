const createTests = require('./test-create-skill');
const getAllTests = require('./test-get-all-skills');
const getByIdTests = require('./test-get-skill-by-id');
const updateTests = require('./test-update-skill');
const deleteTests = require('./test-delete-skill');

/**
 * Run all skill API tests
 */
async function runTests() {
  console.log('🧪 SKILLS ALL API TESTS');
  console.log('=======================\n');

  try {
    // Run all test suites
    console.log('🏃 Running Create Skill Tests...');
    await createTests.runTests();
    console.log('');

    console.log('🏃 Running Get All Skills Tests...');
    await getAllTests.runTests();
    console.log('');

    console.log('🏃 Running Get Skill by ID Tests...');
    await getByIdTests.runTests();
    console.log('');

    console.log('🏃 Running Update Skill Tests...');
    await updateTests.runTests();
    console.log('');

    console.log('🏃 Running Delete Skill Tests...');
    await deleteTests.runTests();
    console.log('');

    console.log('✅ All skill test suites completed');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllSkillTests();
}

module.exports = { runTests };