import { UsersDto } from "./user.dto";
import DB, { T } from "../../../database/index.schema";
import { Users } from "./user.interface";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from '../../utils/email/sendemail';
import validator from "validator";

class UsersService {

  public async getAllActiveClients(): Promise<Users[]> {
    const users = await DB(T.USERS_TABLE)
      .select("*")
      .where({
        account_type: "client",
        is_active: true,
        is_banned: false,
      })
      .orderBy("created_at", "desc");


    return users;
  }
  public async getAllActiveFreelancers(): Promise<Users[]> {
    const users = await DB(T.USERS_TABLE)
      .select("*")
      .where({
        account_type: "freelancer",
        is_active: true,
        is_banned: false,
      })
      .orderBy("created_at", "desc");
    return users;
  }

  public async getactiveeditorcount(): Promise<Users[]> {

    const users = await DB("users as u")
      .leftJoin("projects_task as t", "u.user_id", "t.editor_id")
      .select(
        "u.user_id as editor_id",
        "u.*",
        DB.raw("COALESCE(COUNT(t.projects_task_id), 0) as task_count")
      )
      .where("u.account_type", "freelancer") // ✅ condition on users table
      .groupBy("u.user_id", "u.*")
      .orderBy("task_count", "desc");

    return users;
  }

  public async Insert(data: UsersDto): Promise<Users> {

    if (isEmpty(data)) throw new HttpException(400, "Data Invalid");
    const existingEmployee = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();
    if (existingEmployee)
      throw new HttpException(409, "Email already registered");


    if (data.username) {
      const existingUsername = await DB(T.USERS_TABLE)
        .where({ username: data.username })
        .first();


      if (existingUsername) {
        throw new HttpException(409, "Username already taken");
      }
    }


    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    const res = await DB(T.USERS_TABLE).insert(data).returning("*");
    return res[0];
  }


  public async Login(email: string, password: string): Promise<Users & { token: string }> {

    let user: any;

    if (validator.isEmail(email)) {
      user = await DB(T.USERS_TABLE).where({ email }).first();
    }
    else {
      user = await DB(T.USERS_TABLE).where({ username: email }).first();
    }

    if (!user) {
      throw new HttpException(404, "User not registered");
    }

    if (user.is_banned === true) {
      throw new HttpException(403, "Your account has been banned.");
    }

    if (!user.is_active) {
      throw new HttpException(403, "Your account is not active.");
    }

    const allowedaccountTypes = ['admin'];


    if (!allowedaccountTypes.includes(user.account_type)) {
      throw new HttpException(403, "Access denied for this account type");
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(401, "Incorrect password");
    }
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        profile_picture: user.profile_picture,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );
    return {
      ...user,
      token,
    };
  }


  public async getById(user_id: number): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id, is_active: true, account_status: 'Active' }) // active user
      .first();


    if (!user) throw new HttpException(404, "User not found");
    return user;
  }


  public async updateById(data: UsersDto): Promise<Users> {
    if (!data.user_id) throw new HttpException(400, "User ID required for update");


    const user = await DB(T.USERS_TABLE)
      .where({ user_id: data.user_id })
      .first();


    if (!user) throw new HttpException(404, "User not found");


    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }


    const updated = await DB(T.USERS_TABLE)
      .where({ user_id: data.user_id })
      .update({ ...data, updated_at: new Date() })
      .returning("*");


    return updated[0];
  }


  public async softDelete(user_id: number): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();


    if (!user) throw new HttpException(404, "User not found");


    const updated = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        is_active: false,
        account_status: 'inactive',
        updated_at: new Date()
      })
      .returning("*");


    return updated[0];
  }


  public async getUserByEmail(email: string): Promise<Users> {
    return await DB(T.USERS_TABLE).where({ email }).first();
  }


  public async saveResetToken(user_id: number, token: string, expires: Date): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        reset_token: token,
        reset_token_expires: expires,
      });
  }


  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await DB(T.USERS_TABLE)
      .where({ reset_token: token })
      .andWhere('reset_token_expires', '>', new Date())
      .first();


    if (!user) throw new HttpException(400, "Invalid or expired token");


    const hashed = await bcrypt.hash(newPassword, 10);


    await DB(T.USERS_TABLE)
      .where({ user_id: user.user_id })
      .update({
        password: hashed,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date(),
      });
  }


  private async getUserByType(user_id: number, account_type: string): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({
        user_id,
        account_type,
        account_status: 'Active',
        is_active: true,
        is_banned: false,
      })
      .first();


    if (!user) throw new HttpException(404, `${account_type} user not found`);
    return user;
  }


  public getFreelancerById(user_id: number): Promise<Users> {
    return this.getUserByType(user_id, 'freelancer');
  }


  public getClientById(user_id: number): Promise<Users> {
    return this.getUserByType(user_id, 'client');
  }


  public getAdminById(user_id: number): Promise<Users> {
    return this.getUserByType(user_id, 'admin');
  }


  public async createUserInvitations(data: Record<string, any>,): Promise<void> {
    const { email, username, password } = data;

    if (!email) throw new HttpException(400, "Email is required");

    if (!username) throw new HttpException(400, "Username is required");

    if (!password) throw new HttpException(400, "Password is required");

    const exists = await DB(T.USERS_TABLE).where({ email }).first();
    if (exists) throw new HttpException(409, "User already invited");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    const res = await DB(T.USERS_TABLE).insert(data).returning("*");
    return res[0];

    // await DB(T.USERS_TABLE).insert(data);

  }

  public async validateInvitation(email: string, token: string): Promise<void> {
    const invite = await DB(T.USERS_TABLE)
      .where({ email, invite_token: token, used: false })
      .andWhere('expires_at', '>', new Date())
      .first();


    if (!invite) {
      throw new HttpException(403, "Invalid or expired invitation token");
    }
  }

  public async login(email: string, password: string): Promise<Users & { token: string }> {

    let user: any;

    if (validator.isEmail(email)) {
      user = await DB(T.USERS_TABLE).where({ email }).first();
    }
    else {
      user = await DB(T.USERS_TABLE).where({ username: email }).first();
    }
    if (!user) {
      throw new HttpException(404, "Email not registered");
    }
    if (user.is_banned === true) {
      throw new HttpException(403, "Your account has been banned.");
    }


    if (!user.is_active) {
      throw new HttpException(403, "Your account is not active.");
    }


    const allowedaccountTypes = ['freelancer', 'client'];
    if (!allowedaccountTypes.includes(user.account_type)) {
      throw new HttpException(403, "Access denied for this account type");
    }


    const ispasswordValid = await bcrypt.compare(password, user.password);
    if (!ispasswordValid) {
      throw new HttpException(401, "Incorrect password");
    }
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        profile_picture: user.profile_picture,
        role: user.role,
        is_banned: user.is_banned,
        is_active: user.is_active,
        account_type: user.account_type,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );
    return {
      ...user,
      token,
    };

  }

  public async getfreelancerbyusername(username: string): Promise<any> {
    if (!username) throw new HttpException(400, "Username is required");

    const freelancer = await DB(T.USERS_TABLE)
      .where({ username, account_type: 'freelancer' })
      .first();

    if (!freelancer) throw new HttpException(404, "Freelancer not found");

    return freelancer;
  }


  public async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {


    const user = await DB(T.USERS_TABLE).where({ user_id: userId }).first();

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new HttpException(400, "Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await DB(T.USERS_TABLE)
      .where({ user_id: userId })
      .update({ password: hashedNewPassword, updated_at: new Date() });
  }


  public async createuserInvitation(data: UsersDto): Promise<Users> {

    if (!data.full_name || !data.username || !data.password || !data.email || !data.phone_number) {
      throw new HttpException(400, "Missing required fields");
    }
    if (isEmpty(data)) throw new HttpException(400, "Data Invalid");

    const existingEmployee = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();

    if (existingEmployee)
      throw new HttpException(409, "Email already registered");

    if (data.username) {
      const existingUsername = await DB(T.USERS_TABLE)
        .where({ username: data.username })
        .first();


      if (existingUsername) {
        throw new HttpException(409, "Username already taken");
      }
    }


    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    const res = await DB(T.USERS_TABLE).insert(data).returning("*");
    return res[0];
  }

  // Frontend Multi-Step Registration Service
  public async registerUser(userData: any, files?: any): Promise<{ user: any; token: string }> {
    try {
      // Check if email already exists
      const existingUser = await DB(T.USERS_TABLE).where({ email: userData.email }).first();
      if (existingUser) {
        throw new HttpException(409, "Email already exists");
      }

      // Check if username already exists
      const existingUsername = await DB(T.USERS_TABLE).where({ username: userData.username }).first();
      if (existingUsername) {
        throw new HttpException(409, "Username already taken");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Prepare user data for insertion
      const userInsertData: any = {
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: hashedPassword,
        account_type: userData.account_type,
        phone_number: userData.phone_number || null,
        is_active: true,
        is_banned: false,
        email_verified: false,
        phone_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Handle file uploads if present
      if (files) {
        if (files.id_document && files.id_document[0]) {
          // TODO: Upload to AWS S3 and get URL
          userInsertData.id_document_url = `temp_${files.id_document[0].filename}`;
        }
        if (files.business_documents && files.business_documents.length > 0) {
          // TODO: Upload multiple files to AWS S3 and get URLs
          const documentUrls = files.business_documents.map((file: any) => `temp_${file.filename}`);
          userInsertData.business_documents = JSON.stringify(documentUrls);
        }
      }

      // Add account-type specific fields
      if (userData.account_type === 'freelancer') {
        userInsertData.profile_title = userData.profile_title || null;
        userInsertData.skills = userData.skills ? JSON.stringify(userData.skills) : null;
        userInsertData.experience_level = userData.experience_level || null;
        userInsertData.portfolio_links = userData.portfolio_links || null;
        userInsertData.hourly_rate = userData.hourly_rate || null;
        userInsertData.availability = userData.availability || null;
        userInsertData.hours_per_week = userData.hours_per_week || null;
        userInsertData.work_type = userData.work_type || null;
        userInsertData.languages = userData.languages ? JSON.stringify(userData.languages) : null;
        userInsertData.id_type = userData.id_type || null;
        
        // Address fields for freelancer
        userInsertData.address_line_first = userData.street_address || null;
        userInsertData.city = userData.city || null;
        userInsertData.state = userData.state || null;
        userInsertData.country = userData.country || null;
        userInsertData.pincode = userData.zip_code || null;
      } else if (userData.account_type === 'client') {
        userInsertData.company_name = userData.company_name || null;
        userInsertData.industry = userData.industry || null;
        userInsertData.website = userData.website || null;
        userInsertData.social_links = userData.social_links || null;
        userInsertData.company_size = userData.company_size || null;
        userInsertData.required_services = userData.required_services ? JSON.stringify(userData.required_services) : null;
        userInsertData.required_skills = userData.required_skills ? JSON.stringify(userData.required_skills) : null;
        userInsertData.required_editor_proficiencies = userData.required_editor_proficiencies ? JSON.stringify(userData.required_editor_proficiencies) : null;
        userInsertData.required_videographer_proficiencies = userData.required_videographer_proficiencies ? JSON.stringify(userData.required_videographer_proficiencies) : null;
        userInsertData.budget_min = userData.budget_min || null;
        userInsertData.budget_max = userData.budget_max || null;
        userInsertData.tax_id = userData.tax_id || null;
        userInsertData.work_arrangement = userData.work_arrangement || null;
        userInsertData.project_frequency = userData.project_frequency || null;
        userInsertData.hiring_preferences = userData.hiring_preferences || null;
        userInsertData.expected_start_date = userData.expected_start_date || null;
        userInsertData.project_duration = userData.project_duration || null;
        
        // Address fields for client
        userInsertData.address = userData.address || null;
        userInsertData.city = userData.city || null;
        userInsertData.state = userData.state || null;
        userInsertData.country = userData.country || null;
        userInsertData.pincode = userData.pincode || null;
      }

      // Insert user into database
      const [newUser] = await DB(T.USERS_TABLE).insert(userInsertData).returning("*");

      // Remove password from response
      const { password: _, ...userResponse } = newUser;

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser.user_id,
          email: newUser.email,
          account_type: newUser.account_type 
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      return {
        user: userResponse,
        token: token
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Registration failed: ${error}`);
    }
  }

}
export default UsersService;
