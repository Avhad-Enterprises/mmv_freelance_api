const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
  randomEmail,
  randomUsername,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testApplyToProject() {
  printSection('Testing POST /applications/projects/apply');

  try {
    // First, create test projects with different bidding settings
    console.log('\nSetting up test projects...');

    // Login as admin to create projects
    const adminLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: 'testadmin@example.com', password: 'TestAdmin123!' }
    );
    const adminLoginData = processApiResponse(adminLoginResponse);
    storeToken('ADMIN', adminLoginData.data.token);

    // Create project with bidding enabled
    const biddingEnabledProject = {
      client_id: 2,
      project_title: "Test Bidding Enabled Project",
      project_category: "Video Editing",
      deadline: "2024-12-31",
      project_description: "Test project with bidding enabled",
      budget: 5000.00,
      tags: JSON.stringify(["test", "bidding"]),
      skills_required: ["Adobe Premiere"],
      reference_links: ["https://example.com"],
      additional_notes: "Test project",
      projects_type: "Video Editing",
      project_format: "MP4",
      audio_voiceover: "English",
      audio_description: "Test",
      video_length: 300,
      preferred_video_style: "Professional",
      url: "test-bidding-enabled-" + Date.now(),
      meta_title: "Test Bidding Project",
      meta_description: "Test project with bidding",
      is_active: 1,
      bidding_enabled: true,
      created_by: 1
    };

    const createBiddingProjectResponse = await makeRequest(
      'POST',
      `${BASE_URL}/projects-tasks`,
      biddingEnabledProject,
      authHeader('ADMIN')
    );

    let biddingProjectId = null;
    if (createBiddingProjectResponse.statusCode === 201) {
      biddingProjectId = createBiddingProjectResponse.body.data.projects_task_id;
      console.log(`✅ Created bidding-enabled project with ID: ${biddingProjectId}`);
    }

    // Create project with bidding disabled
    const biddingDisabledProject = {
      ...biddingEnabledProject,
      project_title: "Test Bidding Disabled Project",
      url: "test-bidding-disabled-" + Date.now(),
      bidding_enabled: false
    };

    const createNoBiddingProjectResponse = await makeRequest(
      'POST',
      `${BASE_URL}/projects-tasks`,
      biddingDisabledProject,
      authHeader('ADMIN')
    );

    let noBiddingProjectId = null;
    if (createNoBiddingProjectResponse.statusCode === 201) {
      noBiddingProjectId = createNoBiddingProjectResponse.body.data.projects_task_id;
      console.log(`✅ Created bidding-disabled project with ID: ${noBiddingProjectId}`);
    }

    // Add credits to test users for bidding tests
    console.log('\nAdding credits to test users...');
    
    // Get user IDs for test users by logging in and checking the token
    // First, login as videographer to get user_id
    const tempVideographerLogin = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: 'test.videographer@example.com', password: 'TestPass123!' }
    );
    const tempVideographerData = processApiResponse(tempVideographerLogin);
    
    // Login as video editor to get user_id  
    const tempEditorLogin = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: 'test.videoeditor@example.com', password: 'TestPass123!' }
    );
    const tempEditorData = processApiResponse(tempEditorLogin);
    
    // Add credits using admin login
    const videographerUserId = 86; // From previous test runs
    const editorUserId = 87; // From previous test runs
    
    // Add credits to videographer
    const addCreditsVideographerResponse = await makeRequest(
      'POST',
      `${BASE_URL}/credits/purchase`,
      { credits_amount: 10 },
      { Authorization: `Bearer ${tempVideographerData.data.token}` }
    );
    
    // Add credits to video editor
    const addCreditsEditorResponse = await makeRequest(
      'POST',
      `${BASE_URL}/credits/purchase`,
      { credits_amount: 10 },
      { Authorization: `Bearer ${tempEditorData.data.token}` }
    );
    
    console.log('✅ Added credits to test users');

    // Test 1: Successful application to bidding-enabled project with bid_amount
    console.log('\nTest 1: Apply to bidding-enabled project with bid_amount');
    const videographerEmail = 'test.videographer@example.com';
    const videographerPassword = 'TestPass123!';

    // Login videographer
    const loginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: videographerEmail, password: videographerPassword }
    );
    const loginData = processApiResponse(loginResponse);
    storeToken('VIDEOGRAPHER', loginData.data.token);

    if (biddingProjectId) {
      const applyWithBidResponse = await makeRequest(
        'POST',
        `${BASE_URL}/applications/projects/apply`,
        {
          projects_task_id: biddingProjectId,
          bid_amount: 4500.00,
          bid_message: "I can deliver high quality work for this price"
        },
        authHeader('VIDEOGRAPHER')
      );

      const applyWithBidSuccess = applyWithBidResponse.statusCode === 200 &&
                                  applyWithBidResponse.body.success === true &&
                                  applyWithBidResponse.body.data && parseFloat(applyWithBidResponse.body.data.bid_amount) === 4500;

      printTestResult(
        'Apply to bidding-enabled project with bid_amount',
        applyWithBidSuccess,
        applyWithBidSuccess ? 'Successfully applied with bid' : `Failed to apply with bid - Status: ${applyWithBidResponse.statusCode}, Message: ${applyWithBidResponse.body?.message || 'Unknown'}`,
        applyWithBidResponse
      );
    }

    // Test 2: Fail to apply to bidding-enabled project without bid_amount
    console.log('\nTest 2: Apply to bidding-enabled project without bid_amount (should fail)');
    const editorEmail2 = 'test.videoeditor@example.com';
    const editorPassword2 = 'TestPass123!';

    // Login video editor
    const loginEditorResponse2 = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: editorEmail2, password: editorPassword2 }
    );
    const loginEditorData2 = processApiResponse(loginEditorResponse2);
    storeToken('VIDEO_EDITOR', loginEditorData2.data.token);

    if (biddingProjectId) {
      const applyWithoutBidResponse = await makeRequest(
        'POST',
        `${BASE_URL}/applications/projects/apply`,
        {
          projects_task_id: biddingProjectId,
          description: "Test application without bid"
        },
        authHeader('VIDEO_EDITOR')
      );

      const applyWithoutBidFailed = applyWithoutBidResponse.statusCode === 400;

      printTestResult(
        'Apply to bidding-enabled project without bid_amount',
        applyWithoutBidFailed,
        applyWithoutBidFailed ? 'Correctly rejected application without bid' : `Should have rejected application without bid - Status: ${applyWithoutBidResponse.statusCode}, Message: ${applyWithoutBidResponse.body?.message || 'Unknown'}`,
        applyWithoutBidResponse
      );
    }

    // Test 3: Successful application to bidding-disabled project without bid_amount
    console.log('\nTest 3: Apply to bidding-disabled project without bid_amount');
    if (noBiddingProjectId) {
      const applyNoBiddingResponse = await makeRequest(
        'POST',
        `${BASE_URL}/applications/projects/apply`,
        {
          projects_task_id: noBiddingProjectId,
          description: "Test application to non-bidding project"
        },
        authHeader('VIDEOGRAPHER')
      );

      const applyNoBiddingSuccess = applyNoBiddingResponse.statusCode === 200 &&
                                    applyNoBiddingResponse.body.success === true;

      printTestResult(
        'Apply to bidding-disabled project without bid_amount',
        applyNoBiddingSuccess,
        applyNoBiddingSuccess ? 'Successfully applied to non-bidding project' : 'Failed to apply to non-bidding project',
        applyNoBiddingResponse
      );
    }

    // Test 4: Successful application by video editor
    console.log('\nTest 4: Successful application by video editor');
    const editorEmail = 'test.videoeditor@example.com';
    const editorPassword = 'TestPass123!';

    // Login video editor
    const loginEditorResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: editorEmail, password: editorPassword }
    );
    const loginEditorData = processApiResponse(loginEditorResponse);
    storeToken('VIDEO_EDITOR', loginEditorData.data.token);

    // Apply to project (use the bidding-disabled project)
    const applyEditorResponse = await makeRequest(
      'POST',
      `${BASE_URL}/applications/projects/apply`,
      { projects_task_id: noBiddingProjectId },
      authHeader('VIDEO_EDITOR')
    );

    console.log('Apply editor response:', JSON.stringify(applyEditorResponse, null, 2));

    const editorApplySuccess = applyEditorResponse.statusCode === 200 &&
                               applyEditorResponse.body.success === true;

    printTestResult(
      'Video editor application',
      editorApplySuccess,
      editorApplySuccess ? 'Video editor can apply to project' : 'Video editor application failed',
      applyEditorResponse
    );

    // Test 5: Attempt to apply to non-existent project
    console.log('\nTest 5: Attempt to apply to non-existent project');
    const invalidApplyResponse = await makeRequest(
      'POST',
      `${BASE_URL}/applications/projects/apply`,
      { projects_task_id: 99999 },
      authHeader('VIDEOGRAPHER')
    );

    console.log('Invalid apply response:', JSON.stringify(invalidApplyResponse, null, 2));

    const invalidApplyExpected = invalidApplyResponse.statusCode === 404 ||
                                (invalidApplyResponse.statusCode === 400 && 
                                 invalidApplyResponse.body.message && 
                                 invalidApplyResponse.body.message.includes('Project not found'));

    printTestResult(
      'Non-existent project handling',
      invalidApplyExpected,
      invalidApplyExpected ? 'API correctly handles non-existent projects' : 'Unexpected response for non-existent project',
      invalidApplyResponse
    );

  } catch (error) {
    console.error('Test failed with error:', error.message);
    printTestResult(
      'Apply to project tests',
      false,
      'Apply to project tests failed',
      { error: error.message }
    );
  }
}

module.exports = {
  testApplyToProject
};

// Run tests if called directly
if (require.main === module) {
  testApplyToProject();
}