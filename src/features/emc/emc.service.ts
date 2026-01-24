import DB, { T } from '../../../database/index';
import { UsersDto } from '../user/user.dto';
import HttpException from '../../exceptions/HttpException';
import { USERS_TABLE } from '../../../database/users.schema';
import { PROJECTS_TASK } from '../../../database/projectstask.schema';
import { CATEGORY } from '../../../database/category.schema';
import { FREELANCER_PROFILES } from '../../../database/freelancer_profiles.schema';
import { calculateEmcScore } from './matchEngine';

// Allowed roles for EMC recommendation feature
const FREELANCER_ROLES = ['VIDEOGRAPHER', 'VIDEO_EDITOR'];

class emcService {

  // Helper method to get valid categories from database
  private async getValidCategories(): Promise<string[]> {
    const categories = await DB(CATEGORY)
      .where({ is_active: true, is_deleted: false })
      .select('category_name');
    return categories.map(c => c.category_name);
  }

  public async saveUserArtworkSelection(user_id: number, projects_task_id: number, artwork: string) {
    if (!user_id || !projects_task_id || !artwork) {
      throw new HttpException(400, "User id, project task id, and artwork are required");
    }

    // First check if the project exists and belongs to the user
    const project = await DB(PROJECTS_TASK)
      .where({ 
        projects_task_id: projects_task_id,
        user_id: user_id,
        is_deleted: false
      })
      .first();

    if (!project) {
      throw new HttpException(404, "Project not found or doesn't belong to the user");
    }

    // Check if user already has this artwork
    const existingUser = await DB(USERS_TABLE)
      .where({ 
        user_id: user_id,
        account_type: 'user'
      })
      .select('artworks')
      .first();

    if (existingUser && existingUser.artworks && Array.isArray(existingUser.artworks)) {
      if (existingUser.artworks.includes(artwork)) {
        throw new HttpException(409, "Artwork already added for this user");
      }
    }

    // Update the user's artworks field in users table
    const updated = await DB(USERS_TABLE)
      .where({ 
        user_id: user_id,
        account_type: 'user'
      })
      .update({ 
        artworks: [artwork], 
        updated_at: DB.fn.now() 
      });

    if (!updated) {
      throw new HttpException(404, "Failed to update user artwork");
    }

    return { success: true, message: "Artwork updated for user successfully" };
  }

  public async saveCreatorArtworkSelection(user_id: number, artworks: string[]) {
    if (!user_id || !artworks || !Array.isArray(artworks)) {
      throw new HttpException(400, "User id and artworks array are required");
    }

    if (artworks.length === 0 || artworks.length > 3) {
      throw new HttpException(400, "Artworks array must contain 1-3 items");
    }

    // Check if user exists and is a creator
    const user = await DB(USERS_TABLE)
      .where({ 
        user_id: user_id,
        account_type: 'creator',
        is_active: true 
      })
      .first();

    if (!user) {
      throw new HttpException(404, "Creator not found");
    }

    // Check if any of the artworks are already added
    if (user.artworks && Array.isArray(user.artworks)) {
      const duplicateArtworks = artworks.filter(artwork => user.artworks.includes(artwork));
      if (duplicateArtworks.length > 0) {
        throw new HttpException(409, `Artworks already added: ${duplicateArtworks.join(', ')}`);
      }
    }

    // Update the user's artworks
    const updated = await DB(USERS_TABLE)
      .where({ user_id: user_id })
      .update({ 
        artworks: artworks, 
        updated_at: DB.fn.now() 
      });

    if (!updated) {
      throw new HttpException(404, "Failed to update creator artworks");
    }

    return { success: true, message: "Artworks updated for creator successfully" };
  }

  public async saveUserCategorySelection(user_id: number, projects_task_id: number, category: string) {
    if (!user_id || !projects_task_id || !category) {
      throw new HttpException(400, "User id, project task id, and category are required");
    }

    // Validate category against database
    const validCategories = await this.getValidCategories();
    if (!validCategories.includes(category)) {
      throw new HttpException(400, `Enter valid category. Valid categories are: ${validCategories.join(', ')}`);
    }

    // First check if the project exists and belongs to the user
    const project = await DB(PROJECTS_TASK)
      .where({ 
        projects_task_id: projects_task_id,
        user_id: user_id,
        is_deleted: false
      })
      .first();

    if (!project) {
      throw new HttpException(404, "Project not found or doesn't belong to the user");
    }

    // Check if user already has this category
    const existingUser = await DB(USERS_TABLE)
      .where({ 
        user_id: user_id,
        account_type: 'user'
      })
      .select('category')
      .first();

    if (existingUser && existingUser.category === category) {
      throw new HttpException(409, "Category already added for this user");
    }

    // Update the user's category field in users table
    const updated = await DB(USERS_TABLE)
      .where({ 
        user_id: user_id,
        account_type: 'user'
      })
      .update({ 
        category: category, 
        updated_at: DB.fn.now() 
      });

    if (!updated) {
      throw new HttpException(404, "Failed to update user Category");
    }

    return { success: true, message: "Category updated for user successfully" };
  }

  public async saveCreatorCategorySelection(user_id: number, category: string) {
    if (!user_id || !category ) {
      throw new HttpException(400, "User id and Category are required");
    }

    // Validate category against database
    const validCategories = await this.getValidCategories();
    if (!validCategories.includes(category)) {
      throw new HttpException(400, `Enter valid category. Valid categories are: ${validCategories.join(', ')}`);
    }

    // Check if user exists and is a creator
    const user = await DB(USERS_TABLE)
      .where({ 
        user_id: user_id,
        account_type: 'creator',
        is_active: true 
      })
      .first();

    if (!user) {
      throw new HttpException(404, "Creator not found");
    }

    // Check if creator already has this category
    if (user.category === category) {
      throw new HttpException(409, "Category already added for this creator");
    }

    // Update the user's category
    const updated = await DB(USERS_TABLE)
      .where({ user_id: user_id })
      .update({ 
        category: category, 
        updated_at: DB.fn.now() 
      });

    if (!updated) {
      throw new HttpException(404, "Failed to update creator category");
    }

    return { success: true, message: "Category updated for creator successfully" };
  }

  async getRecommendedEditors(projectid: number) {
    // 1. Fetch project
    const project = await DB(PROJECTS_TASK)
      .where({ projects_task_id: projectid })
      .first();
    if (!project) throw new HttpException(404, 'Project not found');

    // 2. Get user's artwork and category using the project's user_id
    const user = await DB(USERS_TABLE)
      .where({ user_id: project.user_id })
      .select('user_id', 'artworks', 'category')
      .first();
    
    if (!user) throw new HttpException(404, 'User not found');
    
    const userArtworks = Array.isArray(user.artworks) ? user.artworks.map(Number) : [];
    const userCategory = user.category;
    
    if (!userArtworks.length || !userCategory) {
      throw new HttpException(400, 'User missing artwork or category');
    }

    // 3. Fetch all creators
    const creators = await DB(USERS_TABLE)
      .where({ account_type: 'creator', is_active: true , is_banned : false})
      .select('user_id', 'artworks', 'category');

    // 4. Score each creator
    const ranked = creators.map(c => {
      const creatorArtworks = Array.isArray(c.artworks) ? c.artworks.map(Number) : [];
      
      // Calculate EMC score using the first user artwork (assuming single artwork for users)
      const emc = calculateEmcScore(userArtworks[0], creatorArtworks);
      
      // Calculate category match
      const categoryMatch = userCategory === c.category ? 100 : 0;
      
      // Calculate final score
      const finalScore = 0.6 * categoryMatch + 0.4 * emc;
      
      return {
        creator_id: c.user_id,
        finalScore,
        emc,
        categoryMatch
      };
    }).sort((a, b) => b.finalScore - a.finalScore);

    return ranked;
  }

  /**
   * Get recommended projects for a freelancer (Video Editor or Videographer) based on their superpowers
   * Projects matching freelancer's superpowers (which are categories) are prioritized first
   * @param userId - The user ID of the freelancer
   * @param userRoles - The roles array from the authenticated user's token
   */
  public async getRecommendedProjectsForFreelancer(userId: number, userRoles: string[]) {
    // Step 1: Validate that user is a freelancer (Videographer or Video Editor)
    const isFreelancer = userRoles.some(role => FREELANCER_ROLES.includes(role.toUpperCase()));
    
    if (!isFreelancer) {
      throw new HttpException(403, 'This feature is only available for Video Editors and Videographers');
    }

    // Step 2: Get freelancer's superpowers from freelancer_profiles table
    const freelancerProfile = await DB(FREELANCER_PROFILES)
      .select('freelancer_id', 'superpowers', 'user_id')
      .where('user_id', userId)
      .first();

    if (!freelancerProfile) {
      throw new HttpException(404, 'Freelancer profile not found. Please complete your profile setup.');
    }

    // Parse superpowers (handle both string and array formats)
    // Superpowers are categories selected during registration (max 3)
    let superpowers: string[] = [];
    if (freelancerProfile.superpowers) {
      if (typeof freelancerProfile.superpowers === 'string') {
        try {
          superpowers = JSON.parse(freelancerProfile.superpowers);
        } catch {
          superpowers = [freelancerProfile.superpowers];
        }
      } else if (Array.isArray(freelancerProfile.superpowers)) {
        superpowers = freelancerProfile.superpowers;
      }
    }

    // Step 3: Get all active projects that are open for applications (status = 0)
    const allProjects = await DB(PROJECTS_TASK)
      .select(
        'projects_task.*',
        'users.first_name as client_first_name',
        'users.last_name as client_last_name',
        'users.profile_picture as client_profile_picture'
      )
      .leftJoin('client_profiles', 'projects_task.client_id', 'client_profiles.client_id')
      .leftJoin('users', 'client_profiles.user_id', 'users.user_id')
      .where('projects_task.is_active', true)
      .where('projects_task.is_deleted', false)
      .where('projects_task.status', 0) // Only open projects
      .orderBy('projects_task.created_at', 'desc');

    // Step 4: Score projects based on project_category matching with superpowers
    // Superpowers ARE categories - so we do exact category matching
    const scoredProjects = allProjects.map(project => {
      let matchScore = 0;
      let matchedCategory: string | null = null;
      
      const projectCategory = (project.project_category || '').trim();
      
      // Check if project category exactly matches any of the freelancer's superpowers
      for (const superpower of superpowers) {
        const normalizedSuperpower = superpower.trim();
        
        // Exact match (case-insensitive)
        if (projectCategory.toLowerCase() === normalizedSuperpower.toLowerCase()) {
          matchScore = 100;
          matchedCategory = superpower;
          break; // Found exact match, no need to check further
        }
      }

      // Parse skills_required for response
      let skillsRequired: string[] = [];
      if (project.skills_required) {
        if (typeof project.skills_required === 'string') {
          try {
            skillsRequired = JSON.parse(project.skills_required);
          } catch {
            skillsRequired = [project.skills_required];
          }
        } else if (Array.isArray(project.skills_required)) {
          skillsRequired = project.skills_required;
        }
      }

      return {
        ...project,
        skills_required: skillsRequired,
        matchScore,
        isRecommended: matchScore > 0,
        matchedCategory
      };
    });

    // Step 5: Sort by match score (highest first), then by date (newest first)
    scoredProjects.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Determine user role for response
    const userRole = userRoles.includes('VIDEO_EDITOR') ? 'Video Editor' : 'Videographer';

    return {
      success: true,
      data: scoredProjects,
      meta: {
        totalProjects: scoredProjects.length,
        recommendedCount: scoredProjects.filter(p => p.isRecommended).length,
        freelancerSuperpowers: superpowers,
        userRole: userRole
      }
    };
  }
}

export default new emcService();
