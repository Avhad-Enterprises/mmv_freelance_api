const { spawn } = require('child_process');

console.log('🧪 RUNNING ALL BLOG API TESTS');
console.log('====================================');

const tests = [
    'test-get-all-blogs.js',
    'test-get-blog-by-id.js',
    'test-create-blog.js',
    'test-update-blog.js',
    'test-delete-blog.js'
];

let passed = 0;
let failed = 0;
let completed = 0;

function runTest(testFile) {
    return new Promise((resolve) => {
        console.log(`\n▶️  Running ${testFile}...`);

        const testProcess = spawn('node', [testFile], {
            cwd: process.cwd(),
            stdio: 'inherit'
        });

        testProcess.on('close', (code) => {
            completed++;
            if (code === 0) {
                passed++;
                console.log(`✅ ${testFile} PASSED`);
            } else {
                failed++;
                console.log(`❌ ${testFile} FAILED`);
            }

            resolve();
        });

        testProcess.on('error', (error) => {
            completed++;
            failed++;
            console.log(`❌ ${testFile} ERROR: ${error.message}`);
            resolve();
        });
    });
}

async function runAllTests() {
    for (const test of tests) {
        await runTest(`tests/blog/${test}`);
    }

    console.log('\n====================================');
    console.log('FINAL TEST SUMMARY');
    console.log('====================================');
    console.log(`Total Tests: ${tests.length}`);
    console.log(`Completed:   ${completed}`);
    console.log(`Passed:      ${passed}`);
    console.log(`Failed:      ${failed}`);
    console.log('====================================');

    if (failed > 0) {
        console.log('❌ Some tests failed!');
        process.exit(1);
    } else {
        console.log('✅ All blog tests passed!');
        process.exit(0);
    }
}

runAllTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
});
