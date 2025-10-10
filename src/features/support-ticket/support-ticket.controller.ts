

import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../../interfaces/auth.interface';
import supportTicketsService from './support-ticket.service';
import HttpException from '../../exceptions/HttpException';

class supportTicketsController {
  public supportTicketsService = new supportTicketsService();

  // ✅ Create ticket - Personal operation
  public createTicket = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ticketData = req.body;
      // ✅ Security fix: Set user_id from JWT token instead of trusting client
      ticketData.user_id = req.user.user_id;
      
      const result = await this.supportTicketsService.createTicket(ticketData);
      res.status(201).json({ data: result, message: 'Ticket created' });
    } catch (error) {
      next(error);
    }
  };
  // ⚠️ Admin operation - Add note to ticket (keep existing pattern)
  public addNoteToTicket = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = req.body; // Assuming body contains the note details
      // ✅ Security enhancement: Set admin_id from JWT token for audit trail
      data.admin_id = req.user.user_id;

      const result = await this.supportTicketsService.addAdminNote(data);

      res.status(201).json({
        data: result,
        message: "Note added to ticket successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // ⚠️ Admin operation - Get admin notes (enhanced security)
  public getAdminNotes = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ticket_id } = req.body;
      // ✅ Security enhancement: Use authenticated admin's ID
      const admin_id = req.user.user_id;

      if (!ticket_id) {
        throw new HttpException(400, "ticket_id is required");
      }

      const notes = await this.supportTicketsService.getAdminNotes({
        ticket_id,
        admin_id,
      });

      res.status(200).json({ notes, message: "Admin notes fetched successfully" });
    } catch (error) {
      next(error);
    }
  };
  public softDeleteTicket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ticket_id, user_id, user_role } = req.body;

      if (!ticket_id || !user_id || !user_role) {
        throw new HttpException(
          400,
          "ticket_id, user_id, and user_role are required"
        );
      }

      const result = await this.supportTicketsService.softDeleteTicket({
        ticket_id,
        user_id,
        user_role,
      });
      res.status(200).json({ message: result });
    } catch (err) {
      next(err);
    }
  };

  // ✅ Personal operation - Get authenticated user's tickets
  public getMyTickets = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // ✅ Security fix: Use authenticated user's ID and role from JWT
      const user_id = req.user.user_id;
      const role = req.user.roles?.[0] || 'CLIENT'; // Get primary role

      const tickets = await this.supportTicketsService.getAllTickets({
        user_id,
        role,
      });
      res.status(200).json({ tickets, message: "Your tickets fetched successfully" });
    } catch (error) {
      next(error);
    }
  };

  // ⚠️ Admin operation - Get all tickets (keep for admin use)
  public getAllTicketsAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { user_id, role } = req.body;

      if (!user_id || !role) {
        throw new HttpException(400, "user_id and role are required");
      }

      const tickets = await this.supportTicketsService.getAllTickets({
        user_id,
        role,
      });
      res.status(200).json({ tickets });
    } catch (error) {
      next(error);
    }
  };

  public getTicketDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = req.body;
      const ticketData = await this.supportTicketsService.getTicketDetailsByPost(
        data
      );
      res.status(200).json(ticketData);
    } catch (err) {
      next(err);
    }
  };

  // ⚠️ Admin operation - Update ticket status (enhanced security)
  public updateTicketStatus = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ticket_id, status } = req.body;
      // ✅ Security enhancement: Use authenticated admin's ID
      const admin_id = req.user.user_id;

      if (!ticket_id || !status) {
        throw new HttpException(400, "ticket_id and status are required");
      }

      const updatedTicket = await this.supportTicketsService.updateTicketStatus({
        admin_id,
        ticket_id,
        status,
      });

      res.status(200).json({
        message: "Ticket status updated successfully",
        ticket: updatedTicket,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Personal operation - Reply to ticket
  public replyToTicket = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { ticket_id, message } = req.body;
      // ✅ Security fix: Set sender info from JWT token
      const sender_id = req.user.user_id;
      const sender_role = req.user.roles?.[0]?.toLowerCase() || 'client';

      if (!ticket_id || !message?.trim()) {
        throw new HttpException(400, 'ticket_id and message are required');
      }

      const reply = await this.supportTicketsService.addTicketReply({
        ticket_id,
        sender_id,
        sender_role: sender_role as any, // Type assertion for role enum
        message,
      });

      res.status(201).json({
        message: 'Reply posted successfully',
        reply,
      });
    } catch (error) {
      next(error);
    }
  };
  // ✅ Personal operation - Get user's tickets for specific project
  public getMyProjectTickets = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projects_task_id } = req.body;
      // ✅ Security fix: Use authenticated user's ID
      const user_id = req.user.user_id;
      
      if (!projects_task_id) {
        res.status(400).json({ message: "project_task_id is required" });
        return;
      }
      
      const tickets = await this.supportTicketsService.getallticketsid(user_id, projects_task_id);
      res.status(200).json({ data: tickets, message: "Your project tickets retrieved successfully" });
    } catch (error) {
      next(error);
    }
  };

}
export default supportTicketsController;