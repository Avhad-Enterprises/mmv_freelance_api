import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
import authMiddleware from '../../middlewares/auth.middleware';
import supportTicketsController from './support-ticket.controller';

class supportTicketsRoute implements Route {
  public path = '/support_ticket';
  public router = Router();
  public supportTicketsController = new supportTicketsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // ✅ Personal operation - Create a new ticket
    this.router.post(`${this.path}/create`, 
      authMiddleware,
      (req, res, next) => this.supportTicketsController.createTicket(req as any, res, next)
    );

    // ⚠️ Admin operation - Add admin note to ticket
    this.router.post(
      `${this.path}/adminnote`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      (req, res, next) => this.supportTicketsController.addNoteToTicket(req as any, res, next)
    );

    // ⚠️ Admin operation - Get admin notes
    this.router.post(
      `${this.path}/getnotes`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      (req, res, next) => this.supportTicketsController.getAdminNotes(req as any, res, next)
    );

    // ⚠️ Admin/User operation - Soft delete ticket
    this.router.delete(
      `${this.path}/delete`,
      authMiddleware,
      this.supportTicketsController.softDeleteTicket
    );

    // ✅ Personal operation - Get authenticated user's tickets
    this.router.get(
      `${this.path}/my-tickets`,
      authMiddleware,
      (req, res, next) => this.supportTicketsController.getMyTickets(req as any, res, next)
    );

    // ⚠️ Admin operation - Get all tickets for any user
    this.router.post(
      `${this.path}/admin/get-all`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      this.supportTicketsController.getAllTicketsAdmin
    );

    // ⚠️ Mixed operation - Get ticket details (keep existing for now)
    this.router.post(
      `${this.path}/details`,
      authMiddleware,
      this.supportTicketsController.getTicketDetails
    );

    // ⚠️ Admin operation - Update ticket status
    this.router.patch(
      `${this.path}/status`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      (req, res, next) => this.supportTicketsController.updateTicketStatus(req as any, res, next)
    );

    // ✅ Personal operation - Reply to ticket
    this.router.post( 
      `${this.path}/reply`,
      authMiddleware,
      (req, res, next) => this.supportTicketsController.replyToTicket(req as any, res, next)
    );
   
    // ✅ Personal operation - Get user's tickets for specific project
    this.router.post( 
      `${this.path}/my-project-tickets`,
      authMiddleware,
      (req, res, next) => this.supportTicketsController.getMyProjectTickets(req as any, res, next)
    );
  }

}

export default supportTicketsRoute;



// {
//   "user_id": 2,
  
//   "project_id": 5,
//   "ticket_category": "Bug Report",
//   "title": "Issue with payment processing",
//   "subject": "Unable to complete payment via Razorpay",
//   "description": "When I try to make a payment, the Razorpay window loads indefinitely. I’ve tried refreshing, but the issue persists.",
//   "priority": "high",
//   "email": "aanyagupta980@gmail.com",
//   "location": "Mumbai, India",
//   "ip_address": "192.168.1.1",
//   "os_info": "Windows 10",
//   "browser_info": "Chrome 115.0.0",
//   "platform_used": "Web",
//   "support_language": "English"
// }


















// {
 
//   "admin_id": 8,
//    "ticket_id": 1
  
// }
// http://localhost:8000/api/v1/support-ticket/getnotes









// {
//   "ticket_id": 1,
//   "admin_id": 8,
//   "note": "Internal update: Developer team is debugging the login issue."
// }
// // http://localhost:8000/api/v1/support-ticket/adminnote



// {
//   "ticket_id": 123,
//   "user_id": 1,
//   "user_role": "client"
// }
// http://localhost:8000/api/v1/support-ticket/delete







// {
//   "user_id": 1,
//   "role": "admin"
// }
// http://localhost:8000/api/v1/support_ticket/get-all

















// {
//   "ticket_id": 1,
//   "requester_role": "freelancer"
// }
// http://localhost:8000/api/v1/support_ticket/details










// gor reply
// {
//   "ticket_id": 1,
//   "sender_id": 9,
//   "sender_role": "client",
//   "message": "Thanks for the update, I still need help."
// }


// {
    //  "admin_id":1
//   "ticket_id": 123,
//   "status": "closed"
// }
// http://localhost:8000/api/v1/support-ticket/status
