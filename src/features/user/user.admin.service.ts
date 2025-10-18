// User Admin Service
// Handles super admin operations for user management
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import bcrypt from "bcrypt";

/**
 * User Admin Service
 * Handles super admin operations for user management, CRUD operations
 */
class UserAdminService {

  /**
   * Get all users with pagination and filtering
   */
  public async getAllUsers(options: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
  }): Promise<any> {
    const { page, limit, search, role } = options;
    const offset = (page - 1) * limit;

    let query = DB(T.USERS_TABLE)
      .select(
        `${T.USERS_TABLE}.*`,
        DB.raw(`
          COALESCE(
            json_agg(
              json_build_object('role_id', r.role_id, 'name', r.name, 'label', r.label)
            ) FILTER (WHERE r.role_id IS NOT NULL),
            '[]'::json
          ) as roles
        `)
      )
      .leftJoin(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .leftJoin(`${T.ROLE} as r`, `${T.USER_ROLES}.role_id`, `r.role_id`)
      .groupBy(`${T.USERS_TABLE}.user_id`);

    // Apply search filter
    if (search) {
      query = query.where(function() {
        this.where(`${T.USERS_TABLE}.first_name`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.last_name`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.email`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.username`, 'ilike', `%${search}%`);
      });
    }

    // Apply role filter
    if (role) {
      query = query.whereExists(function() {
        this.select('*')
          .from(T.USER_ROLES)
          .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
          .whereRaw(`${T.USER_ROLES}.user_id = ${T.USERS_TABLE}.user_id`)
          .where(`${T.ROLE}.name`, role);
      });
    }

    // Get total count
    const countQuery = DB(T.USERS_TABLE)
      .count('* as total')
      .leftJoin(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .leftJoin(`${T.ROLE} as r`, `${T.USER_ROLES}.role_id`, `r.role_id`);

    if (search) {
      countQuery.where(function() {
        this.where(`${T.USERS_TABLE}.first_name`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.last_name`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.email`, 'ilike', `%${search}%`)
          .orWhere(`${T.USERS_TABLE}.username`, 'ilike', `%${search}%`);
      });
    }

    // Apply role filter to count query
    if (role) {
      countQuery.whereExists(function() {
        this.select('*')
          .from(T.USER_ROLES)
          .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
          .whereRaw(`${T.USER_ROLES}.user_id = ${T.USERS_TABLE}.user_id`)
          .where(`${T.ROLE}.name`, role);
      });
    }

    const [users, totalResult] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(`${T.USERS_TABLE}.created_at`, 'desc'),
      countQuery.first()
    ]);

    const total = parseInt(totalResult?.total as string) || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => ({
        ...user,
        password: undefined // Remove password from response
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Create new user (any type)
   */
  public async createUser(userData: any): Promise<any> {
    const { password, roleName, profileData, ...userInfo } = userData;

    // Check if user already exists
    const existingUser = await DB(T.USERS_TABLE).where({ email: userInfo.email }).first();
    if (existingUser) {
      throw new HttpException(409, 'User with this email already exists');
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user
    const [user] = await DB(T.USERS_TABLE).insert({
      ...userInfo,
      password: hashedPassword,
      username: userInfo.username || userInfo.email.split('@')[0],
      is_active: true,
    }).returning('*');

    // Assign role if provided
    if (roleName) {
      await this.assignRoleToUser(user.user_id, roleName);
    }

    // Create profile based on role
    if (profileData && roleName) {
      await this.createUserProfile(user.user_id, roleName, profileData);
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;
    return userResponse;
  }

  /**
   * Update user by ID
   */
  public async updateUserById(user_id: number, updateData: any): Promise<any> {
    const { password, ...otherData } = updateData;

    // Prepare update object
    const updateObj: any = { ...otherData };

    // Hash new password if provided
    if (password) {
      updateObj.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const [updatedUser] = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        ...updateObj,
        updated_at: DB.fn.now()
      })
      .returning('*');

    if (!updatedUser) {
      throw new HttpException(404, 'User not found');
    }

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;
    return userResponse;
  }

  /**
   * Delete user permanently
   */
  public async deleteUserById(user_id: number): Promise<void> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();

    if (!user) {
      throw new HttpException(404, 'User not found');
    }

    // Delete user (cascade will handle related records)
    await DB(T.USERS_TABLE).where({ user_id }).delete();
  }

  /**
   * Assign role to user
   */
  public async assignRoleToUser(user_id: number, roleName: string): Promise<void> {
    const { assignRole } = await import('../../utils/rbac/role-checker');
    await assignRole(user_id, roleName);
  }

  /**
   * Remove role from user
   */
  public async removeRoleFromUser(user_id: number, roleId: number): Promise<void> {
    await DB(T.USER_ROLES)
      .where({ user_id, role_id: roleId })
      .delete();
  }

  /**
   * Create user profile based on role
   */
  private async createUserProfile(user_id: number, roleName: string, profileData: any): Promise<void> {
    switch (roleName.toUpperCase()) {
      case 'CLIENT':
        await DB('client_profiles').insert({
          user_id,
          ...profileData
        });
        break;
      case 'VIDEOGRAPHER':
        const [freelancerProfile] = await DB('freelancer_profiles').insert({
          user_id,
          ...profileData
        }).returning('*');

        await DB('videographer_profiles').insert({
          freelancer_id: freelancerProfile.freelancer_id
        });
        break;
      case 'VIDEO_EDITOR':
        const [editorProfile] = await DB('freelancer_profiles').insert({
          user_id,
          ...profileData
        }).returning('*');

        await DB('videoeditor_profiles').insert({
          freelancer_id: editorProfile.freelancer_id
        });
        break;
      case 'ADMIN':
      case 'SUPER_ADMIN':
        await DB(T.ADMIN_PROFILES).insert({
          user_id,
          ...profileData
        });
        break;
    }
  }
}

export default UserAdminService;