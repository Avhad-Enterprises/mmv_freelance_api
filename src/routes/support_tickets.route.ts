import { Router } from 'express';
import Route from '../interfaces/route.interface';
import supportTicketsController from '../controllers/support_ticket.controller';

class supportTicketsRoute implements Route {
  public path = '/support_ticket';
  public router = Router();
  public supportTicketsController = new supportTicketsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create a new ticket
    this.router.post(`${this.path}/create`, this.supportTicketsController.createTicket);
   this.router.post(
      `${this.path}/adminnote`,
      this.supportTicketsController.addNoteToTicket
    );
    // supportTicket.route.ts
    this.router.post(
      `${this.path}/getnotes`,
      this.supportTicketsController.getAdminNotes
    );
    this.router.delete(
      `${this.path}/delete`,
      this.supportTicketsController.softDeleteTicket
    );

    this.router.post(
      `${this.path}/get-all`,
      this.supportTicketsController.getAllTickets
    );

    this.router.post(
      `${this.path}/details`,
      this.supportTicketsController.getTicketDetails
    );
     this.router.patch(
      `${this.path}/status`,
      this.supportTicketsController.updateTicketStatus
    );
    this.router.post( `${this.path}/reply`,this.supportTicketsController.replyToTicket );
   
    this.router.post( `${this.path}/getall`, this.supportTicketsController.getallticket);
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
