import DB from '../database/index';
import { PROJECTS_TASK } from '../database/projectstask.schema';

async function createTestProject() {
  try {
    // Check if test project already exists
    const existing = await DB(PROJECTS_TASK).where({ project_title: 'Test Project for Saved Projects API' }).first();
    if (existing) {
      console.log(`Test project already exists with ID: ${existing.projects_task_id}`);
      return existing.projects_task_id;
    }

    // Get test client ID
    const clientProfile = await DB('client_profiles').where({ user_id: 4 }).first();
    if (!clientProfile) {
      console.log('Test client profile not found. Please run create-test-client.ts first.');
      process.exit(1);
    }

    const [project] = await DB(PROJECTS_TASK).insert({
      client_id: clientProfile.client_id,
      project_title: 'Test Project for Saved Projects API',
      project_category: 'Video Editing',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 0, // pending
      project_description: 'This is a test project created for testing the saved projects API functionality.',
      budget: 500.00,
      tags: JSON.stringify(['test', 'api-testing']),
      skills_required: JSON.stringify(['video-editing', 'premiere-pro']),
      reference_links: JSON.stringify(['https://example.com/reference1']),
      additional_notes: 'Test project for API testing purposes.',
      projects_type: 'Video Editing',
      project_format: 'MP4',
      audio_voiceover: 'No',
      audio_description: 'Test audio description',
      video_length: 60, // 60 seconds
      preferred_video_style: 'Professional',
      url: 'test-project-url',
      meta_title: 'Test Project Meta Title',
      meta_description: 'Test project meta description for API testing',
      created_by: 4 // test client user ID
    }).returning('*');

    console.log(`Test project created with ID: ${project.projects_task_id}`);
    return project.projects_task_id;
  } catch (error) {
    console.error('Error creating test project:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createTestProject();