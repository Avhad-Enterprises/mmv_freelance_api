// User Authentication Service
// Handles authentication-related operations like password management, verification, and login tracking
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import bcrypt from "bcrypt";

/**
 * User Authentication Service
 * Handles password management, email/phone verification, and login tracking
 */
class UserAuthService {

  /**
   * Get user by email
   */
  public async getUserByEmail(email: string): Promise<any> {
    return await DB(T.USERS_TABLE)
      .where({ email })
      .first();
  }

  /**
   * Get user by username
   */
  public async getUserByUsername(username: string): Promise<any> {
    return await DB(T.USERS_TABLE)
      .where({ username })
      .first();
  }

  /**
   * Change password
   */
  public async changePassword(
    user_id: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new HttpException(400, "Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        password: hashedNewPassword,
        updated_at: DB.fn.now()
      });
  }

  /**
   * Save password reset token
   */
  public async saveResetToken(
    user_id: number,
    token: string,
    expires: Date
  ): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        reset_token: token,
        reset_token_expires: expires,
      });
  }

  /**
   * Reset password using token
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await DB(T.USERS_TABLE)
      .where({ reset_token: token })
      .andWhere('reset_token_expires', '>', DB.fn.now())
      .first();

    if (!user) {
      throw new HttpException(400, "Invalid or expired token");
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await DB(T.USERS_TABLE)
      .where({ user_id: user.user_id })
      .update({
        password: hashed,
        reset_token: null,
        reset_token_expires: null,
        updated_at: DB.fn.now(),
      });
  }

  /**
   * Verify email
   */
  public async verifyEmail(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        email_verified: true,
        updated_at: DB.fn.now()
      });
  }

  /**
   * Verify phone
   */
  public async verifyPhone(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        phone_verified: true,
        updated_at: DB.fn.now()
      });
  }

  /**
   * Update last login time
   */
  public async updateLastLogin(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        last_login_at: DB.fn.now()
      });
  }

  /**
   * Increment login attempts
   */
  public async incrementLoginAttempts(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .increment('login_attempts', 1);
  }

  /**
   * Reset login attempts
   */
  public async resetLoginAttempts(user_id: number): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        login_attempts: 0
      });
  }
}

export default UserAuthService;