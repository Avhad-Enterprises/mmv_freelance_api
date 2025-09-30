import DB, { T } from '../../../database/index.schema';
import { UsersDto } from '../user/user.dto';
import HttpException from '../../exceptions/HttpException';
import { USERS_TABLE } from '../../../database/users.schema';
import { PROJECTS_TASK } from '../../../database/projectstask.schema';
import { NICHES_TABLE } from '../../../database/niches.schema';
import { calculateEmcScore } from '../../utils/matchEngine';

class emcService {

  // Helper method to get valid niches from database
  private async getValidNiches(): Promise<string[]> {
    const niches = await DB(NICHES_TABLE)
      .where({ is_active: true, is_deleted: false })
      .select('niche_name');
    return niches.map(n => n.niche_name);
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

  public async saveUserNicheSelection(user_id: number, projects_task_id: number, niche: string) {
    if (!user_id || !projects_task_id || !niche) {
      throw new HttpException(400, "User id, project task id, and niche are required");
    }

    // Validate niche against database
    const validNiches = await this.getValidNiches();
    if (!validNiches.includes(niche)) {
      throw new HttpException(400, `Enter valid niche. Valid niches are: ${validNiches.join(', ')}`);
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

    // Check if user already has this niche
    const existingUser = await DB(USERS_TABLE)
      .where({ 
        user_id: user_id,
        account_type: 'user'
      })
      .select('niche')
      .first();

    if (existingUser && existingUser.niche === niche) {
      throw new HttpException(409, "Niche already added for this user");
    }

    // Update the user's niche field in users table
    const updated = await DB(USERS_TABLE)
      .where({ 
        user_id: user_id,
        account_type: 'user'
      })
      .update({ 
        niche: niche, 
        updated_at: DB.fn.now() 
      });

    if (!updated) {
      throw new HttpException(404, "Failed to update user Niche");
    }

    return { success: true, message: "Niche updated for user successfully" };
  }

  public async saveCreatorNicheSelection(user_id: number, niche: string) {
    if (!user_id || !niche ) {
      throw new HttpException(400, "User id and Niche are required");
    }

    // Validate niche against database
    const validNiches = await this.getValidNiches();
    if (!validNiches.includes(niche)) {
      throw new HttpException(400, `Enter valid niche. Valid niches are: ${validNiches.join(', ')}`);
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

    // Check if creator already has this niche
    if (user.niche === niche) {
      throw new HttpException(409, "Niche already added for this creator");
    }

    // Update the user's niche
    const updated = await DB(USERS_TABLE)
      .where({ user_id: user_id })
      .update({ 
        niche: niche, 
        updated_at: DB.fn.now() 
      });

    if (!updated) {
      throw new HttpException(404, "Failed to update creator Niche");
    }

    return { success: true, message: "Niche updated for creator successfully" };
  }

  async getRecommendedEditors(projectid: number) {
    // 1. Fetch project
    const project = await DB(PROJECTS_TASK)
      .where({ projects_task_id: projectid })
      .first();
    if (!project) throw new HttpException(404, 'Project not found');

    // 2. Get user's artwork and niche using the project's user_id
    const user = await DB(USERS_TABLE)
      .where({ user_id: project.user_id })
      .select('user_id', 'artworks', 'niche')
      .first();
    
    if (!user) throw new HttpException(404, 'User not found');
    
    const userArtworks = Array.isArray(user.artworks) ? user.artworks.map(Number) : [];
    const userNiche = user.niche;
    
    if (!userArtworks.length || !userNiche) {
      throw new HttpException(400, 'User missing artwork or niche');
    }

    // 3. Fetch all creators
    const creators = await DB(USERS_TABLE)
      .where({ account_type: 'creator', is_active: true , is_banned : false})
      .select('user_id', 'artworks', 'niche');

    // 4. Score each creator
    const ranked = creators.map(c => {
      const creatorArtworks = Array.isArray(c.artworks) ? c.artworks.map(Number) : [];
      
      // Calculate EMC score using the first user artwork (assuming single artwork for users)
      const emc = calculateEmcScore(userArtworks[0], creatorArtworks);
      
      // Calculate niche match
      const nicheMatch = userNiche === c.niche ? 100 : 0;
      
      // Calculate final score
      const finalScore = 0.6 * nicheMatch + 0.4 * emc;
      
      return {
        creator_id: c.user_id,
        finalScore,
        emc,
        nicheMatch
      };
    }).sort((a, b) => b.finalScore - a.finalScore);

    return ranked;
  }
}

export default new emcService();
