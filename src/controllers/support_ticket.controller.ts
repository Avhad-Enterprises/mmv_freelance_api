

import { NextFunction, Request, Response } from 'express';
import supportTicketsService from '../services/support_ticket.service';
import HttpException from '../exceptions/HttpException';

class supportTicketsController {
  public supportTicketsService = new supportTicketsService();

  // ✅ Create ticket
  public createTicket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ticketData = req.body;
      const result = await this.supportTicketsService.createTicket(ticketData);
      res.status(201).json({ data: result, message: 'Ticket created' });
    } catch (error) {
      next(error);
    }
  };
  public addNoteToTicket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = req.body; // Assuming body contains the note details

      const result = await this.supportTicketsService.addAdminNote(data);

      res.status(201).json({
        data: result,
        message: "Note added to ticket successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getAdminNotes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ticket_id, admin_id } = req.body;

      if (!ticket_id || !admin_id) {
        throw new HttpException(400, "ticket_id and admin_id are required");
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

  public getAllTickets = async (
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

  public updateTicketStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { admin_id, ticket_id, status } = req.body;

      if (!admin_id || !ticket_id || !status) {
        throw new HttpException(400, "admin_id, ticket_id and status are required");
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

  public replyToTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ticket_id, sender_id, sender_role, message } = req.body;

      if (!ticket_id || !sender_id || !sender_role || !message?.trim()) {
        throw new HttpException(400, 'ticket_id, sender_id, sender_role, and message are required');
      }

      const reply = await this.supportTicketsService.addTicketReply({
        ticket_id,
        sender_id,
        sender_role,
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
  public getallticket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id, projects_task_id } = req.body;
      if (!user_id || !projects_task_id) {
        res.status(400).json({ message: "user_id and project_task_id are required" });
        return;
      }
      const tickets = await this.supportTicketsService.getallticketsid(user_id, projects_task_id);
      res.status(200).json({ data: tickets, message: "Support tickets retrieved successfully" });
    } catch (error) {
      next(error);
    }
  };

}
export default supportTicketsController;