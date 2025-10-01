// Auth Service - RBAC-based registration with profile creation
import DB from '../../../database/index.schema';
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
        if (files.business_document && files.business_document[0]) {
          const businessUpload = await uploadRegistrationFile(
            files.business_document[0],
            data.email,
            DocumentType.BUSINESS_DOCUMENT,
            AccountType.CLIENT
          );
          businessDocumentUrl = businessUpload.url;
        }
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
      address_line_first: data.address_line_first,
      city: data.city,
      country: data.country,
      is_active: true,
    }).returning('*');

    await assignRole(user.user_id, 'CLIENT');

    await DB('client_profiles').insert({
      user_id: user.user_id,
      company_name: data.company_name,
      industry: data.industry,
      website: data.website,
      required_services: JSON.stringify(data.required_services || []),
      budget_min: data.budget_min,
      budget_max: data.budget_max,
      id_document_url: idDocumentUrl,
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

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Handle file uploads
    let profilePictureUrl = data.profile_picture || null;
    let idDocumentUrl = null;

    if (files) {
      try {
        // Upload profile picture
        if (files.profile_picture && files.profile_picture[0]) {
          const profileUpload = await uploadRegistrationFile(
            files.profile_picture[0],
            data.email,
            DocumentType.PROFILE_PHOTO,
            AccountType.VIDEOGRAPHER
          );
          profilePictureUrl = profileUpload.url;
        }

        // Upload ID document
        if (files.id_document && files.id_document[0]) {
          const idUpload = await uploadRegistrationFile(
            files.id_document[0],
            data.email,
            DocumentType.ID_DOCUMENT,
            AccountType.VIDEOGRAPHER
          );
          idDocumentUrl = idUpload.url;
        }
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
      country: data.country,
      is_active: true,
    }).returning('*');

    await assignRole(user.user_id, 'VIDEOGRAPHER');

    const [freelancerProfile] = await DB('freelancer_profiles').insert({
      user_id: user.user_id,
      profile_title: data.profile_title,
      skills: JSON.stringify(data.skills || []),
      experience_level: data.experience_level,
      hourly_rate: data.hourly_rate,
      portfolio_links: JSON.stringify(data.portfolio_links || []),
      short_description: data.short_description,
      id_document_url: idDocumentUrl,
    }).returning('*');

    await DB('videographer_profiles').insert({
      profile_id: freelancerProfile.profile_id,
    });

    // Generate token
    const token = this.generateToken(user.user_id, user.email, ['VIDEOGRAPHER']);

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
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

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Handle file uploads
    let profilePictureUrl = data.profile_picture || null;
    let idDocumentUrl = null;

    if (files) {
      try {
        // Upload profile picture
        if (files.profile_picture && files.profile_picture[0]) {
          const profileUpload = await uploadRegistrationFile(
            files.profile_picture[0],
            data.email,
            DocumentType.PROFILE_PHOTO,
            AccountType.VIDEOEDITOR
          );
          profilePictureUrl = profileUpload.url;
        }

        // Upload ID document
        if (files.id_document && files.id_document[0]) {
          const idUpload = await uploadRegistrationFile(
            files.id_document[0],
            data.email,
            DocumentType.ID_DOCUMENT,
            AccountType.VIDEOEDITOR
          );
          idDocumentUrl = idUpload.url;
        }
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
      country: data.country,
      is_active: true,
    }).returning('*');

    await assignRole(user.user_id, 'VIDEO_EDITOR');

    const [freelancerProfile] = await DB('freelancer_profiles').insert({
      user_id: user.user_id,
      profile_title: data.profile_title,
      skills: JSON.stringify(data.skills || []),
      experience_level: data.experience_level,
      hourly_rate: data.hourly_rate,
      portfolio_links: JSON.stringify(data.portfolio_links || []),
      short_description: data.short_description,
      id_document_url: idDocumentUrl,
    }).returning('*');

    await DB('videoeditor_profiles').insert({
      profile_id: freelancerProfile.profile_id,
    });

    // Generate token
    const token = this.generateToken(user.user_id, user.email, ['VIDEO_EDITOR']);

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
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
