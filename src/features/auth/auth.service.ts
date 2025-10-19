// Auth Service - RBAC-based registration with profile creation
import DB from '../../../database/index';
import { USERS_TABLE } from '../../../database/users.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { assignRole } from '../../utils/rbac/role-checker';
import HttpException from '../../exceptions/HttpException';
import { 
  uploadRegistrationFile, 
  uploadMultipleRegistrationFiles,
  UploadResult 
} from '../../utils/registration-upload';
import { DocumentType, AccountType, MulterFile } from '../../interfaces/file-upload.interface';

export class AuthService {
  /**
   * Register a new client
   */
  public async registerClient(data: any, files?: { [fieldname: string]: MulterFile[] }) {
    const existingUser = await DB(USERS_TABLE).where({ email: data.email }).first();
    if (existingUser) {
      throw new HttpException(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Handle file uploads
    let profilePictureUrl = data.profile_picture || null;
    let idDocumentUrl = null;
    let businessDocumentUrl = null;

    if (files) {
      console.log('📁 Files received for client registration:', Object.keys(files));
      console.log('📋 File details:', Object.entries(files).map(([key, fileArray]) => ({
        field: key,
        count: fileArray?.length || 0,
        files: fileArray?.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype })) || []
      })));
      
      try {
        // Upload profile picture
        if (files.profile_picture && files.profile_picture[0]) {
          const profileUpload = await uploadRegistrationFile(
            files.profile_picture[0],
            data.email,
            DocumentType.PROFILE_PHOTO,
            AccountType.CLIENT
          );
          profilePictureUrl = profileUpload.url;
        }

        // Upload ID document
        if (files.id_document && files.id_document[0]) {
          const idUpload = await uploadRegistrationFile(
            files.id_document[0],
            data.email,
            DocumentType.ID_DOCUMENT,
            AccountType.CLIENT
          );
          idDocumentUrl = idUpload.url;
        }

        // Upload business document (specific to clients)
        // Primary field name: business_document, fallback: business_documents (legacy)
        const businessFile = files.business_document?.[0] || files.business_documents?.[0];
        if (businessFile) {
          // Frontend should now prevent empty files, but keep validation for safety
          if (businessFile.size === 0 || !businessFile.buffer || businessFile.buffer.length === 0) {
            console.warn('⚠️ Skipping empty business document upload (frontend should prevent this)');
          } else {
            const businessUpload = await uploadRegistrationFile(
              businessFile,
              data.email,
              DocumentType.BUSINESS_DOCUMENT,
              AccountType.CLIENT
            );
            businessDocumentUrl = businessUpload.url;
          }
        }
      } catch (error: any) {
        console.error('❌ File upload error in auth service:', error.message);
        throw new HttpException(400, `File upload failed: ${error.message}`);
      }
    }

    const [user] = await DB(USERS_TABLE).insert({
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.email.split('@')[0],
      email: data.email,
      password: hashedPassword,
      phone_number: data.phone_number,
      profile_picture: profilePictureUrl,
      country: data.country,
      state: data.state,
      city: data.city,
      pincode: data.zip_code || data.pincode || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      is_active: true,
    }).returning('*');

    await assignRole(user.user_id, 'CLIENT');

    await DB('client_profiles').insert({
      user_id: user.user_id,
      company_name: data.company_name,
      website: data.company_website,
      social_links: data.social_links,
      company_description: data.company_description || 'No description provided',
      industry: data.industry,
      company_size: data.company_size,
      project_title: data.project_title || 'Untitled Project',
      project_description: data.project_description || 'No description provided',
      project_category: data.project_category || 'General',
      project_budget: data.project_budget || 0,
      project_timeline: data.project_timeline || 'Not specified',
      work_arrangement: data.work_arrangement || null,
      project_frequency: data.project_frequency || null,
      hiring_preferences: data.hiring_preferences || null,
      terms_accepted: data.terms_accepted || false,
      privacy_policy_accepted: data.privacy_policy_accepted || false,
      business_document_url: businessDocumentUrl,
    });

    // Generate token
    const token = this.generateToken(user.user_id, user.email, ['CLIENT']);

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: 'CLIENT',
        profile_picture: profilePictureUrl,
      },
      token,
    };
  }

  /**
   * Register a new videographer
   */
  public async registerVideographer(data: any, files?: { [fieldname: string]: MulterFile[] }) {
    const existingUser = await DB(USERS_TABLE).where({ email: data.email }).first();
    if (existingUser) {
      throw new HttpException(409, 'Email already registered');
    }

    // Validate required files
    if (!files || !files.profile_photo || !files.profile_photo[0]) {
      throw new HttpException(400, 'Profile photo is required');
    }
    if (!files || !files.id_document || !files.id_document[0]) {
      throw new HttpException(400, 'ID document is required');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Handle file uploads
    let profilePictureUrl = null;
    let idDocumentUrl = null;

    if (files) {
      try {
        // Upload profile picture (required)
        const profileUpload = await uploadRegistrationFile(
          files.profile_photo[0],
          data.email,
          DocumentType.PROFILE_PHOTO,
          AccountType.VIDEOGRAPHER
        );
        profilePictureUrl = profileUpload.url;

        // Upload ID document (required)
        const idUpload = await uploadRegistrationFile(
          files.id_document[0],
          data.email,
          DocumentType.ID_DOCUMENT,
          AccountType.VIDEOGRAPHER
        );
        idDocumentUrl = idUpload.url;
      } catch (error) {
        throw new HttpException(400, `File upload failed: ${error.message}`);
      }
    }

    const [user] = await DB(USERS_TABLE).insert({
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.email.split('@')[0],
      email: data.email,
      password: hashedPassword,
      phone_number: data.phone_number,
      profile_picture: profilePictureUrl,
      city: data.city,
      state: data.state || null,
      country: data.country,
      pincode: data.pincode || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      is_active: true,
    }).returning('*');

    await assignRole(user.user_id, 'VIDEOGRAPHER');

    // Clean up any existing freelancer profile for this user (for test cleanup or re-registration)
    await DB('freelancer_profiles').where({ user_id: user.user_id }).del();

    const [freelancerProfile] = await DB('freelancer_profiles').insert({
      user_id: user.user_id,
      profile_title: `${data.first_name} ${data.last_name}`,
      skills: Array.isArray(data.skill_tags) ? JSON.stringify(data.skill_tags) : data.skill_tags,
      skill_tags: Array.isArray(data.skill_tags) ? JSON.stringify(data.skill_tags) : data.skill_tags,
      superpowers: Array.isArray(data.superpowers) ? JSON.stringify(data.superpowers) : data.superpowers,
      portfolio_links: Array.isArray(data.portfolio_links) ? JSON.stringify(data.portfolio_links) : data.portfolio_links,
      rate_amount: data.rate_amount || 0,
      currency: data.rate_currency || 'INR',
      short_description: data.short_description,
      languages: Array.isArray(data.languages) ? JSON.stringify(data.languages) : data.languages,
      availability: data.availability || 'full-time',
      id_type: data.id_type,
      id_document_url: idDocumentUrl,
      experience_level: data.experience_level,
      role: data.role,
      base_skills: Array.isArray(data.base_skills) ? JSON.stringify(data.base_skills) : data.base_skills,
    }).returning('*');

    // Clean up any existing videographer profile for this freelancer (for test cleanup)
    await DB('videographer_profiles').where({ freelancer_id: freelancerProfile.freelancer_id }).del();

    await DB('videographer_profiles').insert({
      freelancer_id: freelancerProfile.freelancer_id,
    });

    // Generate token
    const token = this.generateToken(user.user_id, user.email, ['VIDEOGRAPHER']);

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: data.full_name,
        user_type: 'VIDEOGRAPHER',
        profile_picture: profilePictureUrl,
      },
      token,
    };
  }

  /**
   * Register a new video editor
   */
  public async registerVideoEditor(data: any, files?: { [fieldname: string]: MulterFile[] }) {
    const existingUser = await DB(USERS_TABLE).where({ email: data.email }).first();
    if (existingUser) {
      throw new HttpException(409, 'Email already registered');
    }

    // Validate required files
    if (!files || !files.profile_photo || !files.profile_photo[0]) {
      throw new HttpException(400, 'Profile photo is required');
    }
    if (!files || !files.id_document || !files.id_document[0]) {
      throw new HttpException(400, 'ID document is required');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Handle file uploads
    let profilePictureUrl = null;
    let idDocumentUrl = null;

    if (files) {
      try {
        // Upload profile picture (required)
        const profileUpload = await uploadRegistrationFile(
          files.profile_photo[0],
          data.email,
          DocumentType.PROFILE_PHOTO,
          AccountType.VIDEOEDITOR
        );
        profilePictureUrl = profileUpload.url;

        // Upload ID document (required)
        const idUpload = await uploadRegistrationFile(
          files.id_document[0],
          data.email,
          DocumentType.ID_DOCUMENT,
          AccountType.VIDEOEDITOR
        );
        idDocumentUrl = idUpload.url;
      } catch (error) {
        throw new HttpException(400, `File upload failed: ${error.message}`);
      }
    }

    const [user] = await DB(USERS_TABLE).insert({
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.email.split('@')[0],
      email: data.email,
      password: hashedPassword,
      phone_number: data.phone_number,
      profile_picture: profilePictureUrl,
      country: data.country,
      state: data.state || null,
      city: data.city,
      pincode: data.pincode || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      is_active: true,
    }).returning('*');

    await assignRole(user.user_id, 'VIDEO_EDITOR');

    // Clean up any existing freelancer profile for this user (for test cleanup or re-registration)
    await DB('freelancer_profiles').where({ user_id: user.user_id }).del();

    const [freelancerProfile] = await DB('freelancer_profiles').insert({
      user_id: user.user_id,
      profile_title: `${data.first_name} ${data.last_name}`,
      skills: Array.isArray(data.skill_tags) ? JSON.stringify(data.skill_tags) : data.skill_tags,
      skill_tags: Array.isArray(data.skill_tags) ? JSON.stringify(data.skill_tags) : data.skill_tags,
      superpowers: Array.isArray(data.superpowers) ? JSON.stringify(data.superpowers) : data.superpowers,
      portfolio_links: Array.isArray(data.portfolio_links) ? JSON.stringify(data.portfolio_links) : data.portfolio_links,
      rate_amount: data.rate_amount,
      currency: 'INR',
      short_description: data.short_description,
      languages: Array.isArray(data.languages) ? JSON.stringify(data.languages) : data.languages,
      availability: data.availability,
      id_type: data.id_type,
      id_document_url: idDocumentUrl,
      experience_level: data.experience_level,
      role: data.role,
      base_skills: Array.isArray(data.base_skills) ? JSON.stringify(data.base_skills) : data.base_skills,
    }).returning('*');

    // Clean up any existing videoeditor profile for this freelancer (for test cleanup)
    await DB('videoeditor_profiles').where({ freelancer_id: freelancerProfile.freelancer_id }).del();

    await DB('videoeditor_profiles').insert({
      freelancer_id: freelancerProfile.freelancer_id,
    });

    // Generate token
    const token = this.generateToken(user.user_id, user.email, ['VIDEO_EDITOR']);

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: data.full_name,
        user_type: 'VIDEO_EDITOR',
        profile_picture: profilePictureUrl,
      },
      token,
    };
  }

  /**
   * Login user with email and password
   */
  public async login(email: string, password: string) {
    const user = await DB(USERS_TABLE)
      .where({ email, is_active: true })
      .first();

    if (!user) {
      throw new HttpException(404, 'User not found');
    }

    // Check if user is banned
    if (user.is_banned) {
      throw new HttpException(403, 'Account is banned');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await this.incrementLoginAttempts(user.user_id);
      throw new HttpException(401, 'Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user.user_id);

    // Update last login time
    await this.updateLastLogin(user.user_id);

    // Get user roles
    const roles = await DB('user_roles')
      .join('role', 'user_roles.role_id', 'role.role_id')
      .where('user_roles.user_id', user.user_id)
      .select('role.name as role_name');

    // Generate JWT token
    const token = this.generateToken(
      user.user_id, 
      user.email, 
      roles.map(r => r.role_name)
    );

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        roles: roles.map(r => r.role_name),
      },
      token,
    };
  }

  /**
   * Update last login time
   */
  private async updateLastLogin(user_id: number): Promise<void> {
    await DB(USERS_TABLE)
      .where({ user_id })
      .update({ last_login_at: DB.fn.now() });
  }

  /**
   * Increment login attempts
   */
  private async incrementLoginAttempts(user_id: number): Promise<void> {
    await DB(USERS_TABLE)
      .where({ user_id })
      .increment('login_attempts', 1);
  }

  /**
   * Reset login attempts
   */
  private async resetLoginAttempts(user_id: number): Promise<void> {
    await DB(USERS_TABLE)
      .where({ user_id })
      .update({ login_attempts: 0 });
  }

  /**
   * Generate JWT token
   */
  private generateToken(user_id: number, email: string, roles: string[]): string {
    return jwt.sign(
      {
        id: user_id, // Use 'id' to match DataStoredInToken interface
        user_id,
        email,
        roles,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
  }
}
