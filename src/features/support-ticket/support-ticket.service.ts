// services/supportTicket.service.ts
import DB, { T } from '../../../database/index';
import { SupportTicket } from './support-ticket.interface';
import HttpException from '../../exceptions/HttpException';
import { isEmpty } from '../../utils/common';
import { sendSupportTicketEmail } from '../../utils/email';
import { ITicketNote } from '../../interfaces/support_ticket_notes.interface';
import { TicketNoteDto } from './support-ticket-notes.dto';
import { hasRole, getUserRoles } from '../../utils/rbac/role-checker';

class supportTicketService {
 public async createTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
  if (!ticketData || Object.keys(ticketData).length === 0) {
    throw new HttpException(400, 'Ticket data is required');
  }

  const { subject, ticket_category, description, priority, user_id, email } = ticketData;

  if (!subject || !ticket_category || !description) {
    throw new HttpException(400, 'Subject, category, and description are required');
  }

  const emailContent = `
New Support Ticket Received

Subject: ${subject}
Category: ${ticket_category}
Priority: ${priority ?? 'low'}
Description: ${description}

From User ID: ${user_id ?? 'N/A'}
User Email: ${email ?? 'N/A'}
`;

  const supportEmail = process.env.SUPPORT_EMAIL || 'ujalag.cs.22@nitj.ac.in';
  const replyTo = email ?? undefined;

  const insertData: Partial<SupportTicket> = {
    ...ticketData,
    priority: priority ?? 'low',
    status: 'open',
    created_at: DB.fn.now(),
    updated_at: DB.fn.now(),
  };

  const [ticket] = await DB(T.SUPPORT_TICKETS_TABLE).insert(insertData).returning('*');

  try {
    await sendSupportTicketEmail({
      to: supportEmail,
      subject: 'New Support Ticket',
      ticketId: ticket.id.toString(),
      message: emailContent,
      replyTo
    });

    // ✅ Log success in email_logs table
    await DB(T.EMAIL_LOG_TABLE).insert({
      ticket_id: ticket.id,
      to_email: supportEmail,
      subject: 'New Support Ticket',
      body: emailContent,
      status: 'sent',
      sent_at: DB.fn.now(),
    });
  } catch (err) {
    console.error('Support email send failed:', err);

    // ✅ Log failure in email_logs table
    await DB(T.EMAIL_LOG_TABLE).insert({
      ticket_id: ticket.id,
      to_email: supportEmail,
      subject: 'New Support Ticket',
      body: emailContent,
      status: 'failed',
      sent_at: DB.fn.now(),
    });
  }

  return ticket;
}


  public async addAdminNote(data: TicketNoteDto): Promise<ITicketNote> {
    if (isEmpty(data)) throw new HttpException(400, "Note data is required");

    const { ticket_id, admin_id, note } = data;

    if (!ticket_id || !admin_id || !note.trim()) {
      throw new HttpException(400, "ticket_id, admin_id, and note are required");
    }

    // ✅ Check if user has ADMIN role using RBAC
    const isAdmin = await hasRole(admin_id, 'ADMIN');
    if (!isAdmin) {
      throw new HttpException(403, "Only admins can perform this action");
    }

    const ticket = await DB(T.SUPPORT_TICKETS_TABLE).where({ id: ticket_id }).first();
    if (!ticket) throw new HttpException(404, "Ticket not found");

    const [newNote] = await DB(T.TICKET_NOTE_TABLE)
      .insert({
        ticket_id,
        admin_id,
        note,
      })
      .returning("*");

    if (!newNote) throw new HttpException(500, "Failed to add admin note");

    return newNote as ITicketNote;
  }

  public async getAdminNotes(data: {
    ticket_id: number;
    admin_id: number;
  }): Promise<ITicketNote[]> {
    const { ticket_id, admin_id } = data;

    if (!ticket_id || !admin_id) {
      throw new HttpException(400, "ticket_id and admin_id are required");
    }

    // ✅ Check if user has ADMIN role using RBAC
    const isAdmin = await hasRole(admin_id, 'ADMIN');
    if (!isAdmin) {
      throw new HttpException(403, "Only admins can view notes");
    }

    const ticket = await DB(T.SUPPORT_TICKETS_TABLE).where({ id: ticket_id }).first();
    if (!ticket) throw new HttpException(404, "Ticket not found");

    const notes = await DB(T.TICKET_NOTE_TABLE)
      .where({ ticket_id })
      .orderBy("created_at", "desc");

    return notes as ITicketNote[];
  }

  public async softDeleteTicket(data: {
    ticket_id: number;
    user_id: number;
    user_role: string;
  }): Promise<string> {
    const { ticket_id, user_id, user_role } = data;

    const ticket = await DB(T.SUPPORT_TICKETS_TABLE).where({ id: ticket_id }).first();
    if (!ticket) throw new HttpException(404, "Ticket not found");

    // ✅ Check if user is admin using RBAC
    const isAdmin = await hasRole(user_id, 'ADMIN');
    const isOwner = ticket.user_id === user_id;

    if (!isAdmin && (!isOwner || ticket.status !== "open")) {
      throw new HttpException(403, "Not authorized to delete this ticket");
    }

    await DB(T.SUPPORT_TICKETS_TABLE).where({ id: ticket_id }).update({
      is_deleted: true,
      deleted_by: user_id,
      deleted_at: DB.fn.now(),
    });

    return "Ticket soft-deleted successfully";
  }

  public async getAllTickets(data: { user_id: number; role: string }) {
    const { user_id, role } = data;

    if (!user_id || !role) {
      throw new HttpException(400, "user_id and role are required");
    }

    let query = DB(T.SUPPORT_TICKETS_TABLE).where({ is_deleted: false });

    // ✅ Check if user is admin using RBAC
    const isAdmin = await hasRole(user_id, 'ADMIN');
    if (!isAdmin) {
      query = query.andWhere({ user_id });
    }

    const tickets = await query.orderBy("created_at", "desc");
    return tickets;
  }

  public async getTicketDetailsByPost(data: {
    ticket_id: number;
    requester_role: string;
  }) {
    const { ticket_id, requester_role } = data;

    if (!ticket_id || !requester_role) {
      throw new HttpException(400, "ticket_id and requester_role are required");
    }

    const ticket = await DB(T.SUPPORT_TICKETS_TABLE)
      .where({ id: ticket_id, is_deleted: false })
      .first();

    if (!ticket) throw new HttpException(404, "Ticket not found");

    const replies = await DB(T.TICKET_REPLY_TABLE)
      .where({ ticket_id })
      .orderBy("created_at", "asc");

    let notes = [];
    if (requester_role === "admin") {
      notes = await DB(T.TICKET_NOTE_TABLE)
        .where({ ticket_id })
        .orderBy("created_at", "asc");
    }

    return {
      ticket,
      replies,
      notes,
    };
  }

  public async updateTicketStatus(data: {
    admin_id: number;
    ticket_id: number;
    status: string;
  }): Promise<SupportTicket> {
    const { admin_id, ticket_id, status } = data;

    // ✅ Check if user has ADMIN role using RBAC
    const isAdmin = await hasRole(admin_id, 'ADMIN');
    if (!isAdmin) {
      throw new HttpException(403, "Only admins can update ticket status");
    }

    const allowedStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!allowedStatuses.includes(status)) {
      throw new HttpException(400, "Invalid status value");
    }

    const ticket = await DB(T.SUPPORT_TICKETS_TABLE).where({ id: ticket_id }).first();
    if (!ticket) throw new HttpException(404, "Ticket not found");

    const [updated] = await DB(T.SUPPORT_TICKETS_TABLE)
      .where({ id: ticket_id })
      .update({ status, updated_at: DB.fn.now() })
      .returning("*");

    return updated as SupportTicket;
  }

 public async addTicketReply(data: {
  ticket_id: number;
  sender_id: number;
  sender_role: "client" | "freelancer" | "admin";
  message: string;
}): Promise<string> {
  const { ticket_id, sender_id, sender_role, message } = data;

  if (!ticket_id || !sender_id || !sender_role || !message.trim()) {
    throw new HttpException(400, "ticket_id, sender_id, sender_role, and message are required");
  }

  // ✅ Verify sender exists and has the claimed role using RBAC
  const sender = await DB(T.USERS_TABLE).where({ user_id: sender_id }).first();
  if (!sender) {
    throw new HttpException(404, "Sender not found");
  }

  // Map legacy role names to RBAC role names
  const roleMap: { [key: string]: string } = {
    'client': 'CLIENT',
    'freelancer': 'VIDEOGRAPHER', // or VIDEO_EDITOR
    'admin': 'ADMIN'
  };

  // Verify sender has the claimed role
  if (sender_role === 'admin') {
    const isAdmin = await hasRole(sender_id, 'ADMIN');
    if (!isAdmin) {
      throw new HttpException(403, "Sender does not have admin role");
    }
  } else if (sender_role === 'client') {
    const isClient = await hasRole(sender_id, 'CLIENT');
    if (!isClient) {
      throw new HttpException(403, "Sender does not have client role");
    }
  } else if (sender_role === 'freelancer') {
    // Check if user is either videographer or video editor
    const userRoles = await getUserRoles(sender_id);
    const isFreelancer = userRoles.includes('VIDEOGRAPHER') || userRoles.includes('VIDEO_EDITOR');
    if (!isFreelancer) {
      throw new HttpException(403, "Sender does not have freelancer role");
    }
  }

  const ticket = await DB(T.SUPPORT_TICKETS_TABLE).where({ id: ticket_id }).first();
  if (!ticket) throw new HttpException(404, "Ticket not found");

  await DB(T.TICKET_REPLY_TABLE).insert({
    ticket_id,
    sender_id,
    sender_role,
    message,
    created_at: DB.fn.now(),
  });

  let recipientEmail = "";

  if (sender_role === "admin") {
    const user = await DB(T.USERS_TABLE).where({ user_id: ticket.user_id }).first();
    if (user) recipientEmail = user.email;
  } else {
    // ✅ Find an admin using RBAC system
    const admin = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .where(`${T.ROLE}.name`, 'ADMIN')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .select(`${T.USERS_TABLE}.*`)
      .first();
    
    if (admin) {
      recipientEmail = admin.email || "aanyagupta980@gmail.com";
    }
  }

  const emailContent = `
New reply to Support Ticket #${ticket_id}

From: ${sender_role} (${sender.email})
Message: ${message}
`;

  if (recipientEmail) {
    try {
      await sendSupportTicketEmail({
        to: recipientEmail,
        subject: 'Support Ticket Reply',
        ticketId: ticket_id.toString(),
        message: message,
        replyTo: sender.email
      });

      // ✅ Log successful email
      await DB(T.EMAIL_LOG_TABLE).insert({
        ticket_id,
        to_email: recipientEmail,
        subject: `Reply to Ticket #${ticket_id}`,
        body: emailContent,
        status: 'sent',
        sent_at: DB.fn.now(),
      });
    } catch (err) {
      console.error('Reply email send failed:', err);

      // ✅ Log failed email
      await DB(T.EMAIL_LOG_TABLE).insert({
        ticket_id,
        to_email: recipientEmail,
        subject: `Reply to Ticket #${ticket_id}`,
        body: emailContent,
        status: 'failed',
        sent_at: DB.fn.now(),
      });
    }
  }

  return "Reply added and notification sent";
}
public getallticketsid = async (user_id: number, projects_task_id: number): Promise<any[]> => {
  if (!user_id || !projects_task_id) {
    throw new HttpException(400, "user_id and project_task_id are required");
  }

  const result = await DB(T.SUPPORT_TICKETS_TABLE)
   .leftJoin(`${T.PROJECTS_TASK} as project`, `${T.SUPPORT_TICKETS_TABLE}.project_id`, 'project.projects_task_id')
    .leftJoin(`${T.USERS_TABLE} as user`, `${T.SUPPORT_TICKETS_TABLE}.user_id`, 'user.user_id')
    .where(`${T.SUPPORT_TICKETS_TABLE}.is_deleted`, false)
    .andWhere(`${T.SUPPORT_TICKETS_TABLE}.project_id`, projects_task_id)
    .andWhere(`${T.SUPPORT_TICKETS_TABLE}.user_id`, user_id)
    .orderBy(`${T.SUPPORT_TICKETS_TABLE}.created_at`, 'desc')
    .select(
      `${T.SUPPORT_TICKETS_TABLE}.*`,

      // PROJECT
      'project.projects_task_id as project_id',
      'project.project_title as project_title',

      // USER
      'user.user_id as user_id',
      'user.first_name as user_first_name',
      'user.last_name as user_last_name',
      'user.profile_picture as user_profile_picture'
    );

  return result;
};
}

export default supportTicketService;
