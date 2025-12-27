# Credit Management System Documentation

> **Version**: 1.0  
> **Last Updated**: December 2024

---

## Welcome

This documentation provides comprehensive information about the Credit Management System for the MMV Freelance platform.

---

## Quick Start

1. **New to credits?** Start with [Overview](./01_OVERVIEW.md)
2. **Building frontend?** Jump to [Frontend Integration](./08_FRONTEND_INTEGRATION.md)
3. **Need API details?** See [API Reference](./06_API_REFERENCE.md)
4. **Implementing payments?** Check [Payment Integration](./09_PAYMENT_INTEGRATION.md)

---

## What is the Credit System?

A monetization system where freelancers purchase credits to apply for projects:

- **1 Credit = 1 Application**
- **Packages available** with bulk discounts
- **Razorpay** for payment processing
- **Admin tools** for management and analytics

---

## Documentation Index

| #   | Document                                             | Description                              | Who Should Read          |
| --- | ---------------------------------------------------- | ---------------------------------------- | ------------------------ |
| 01  | [Overview](./01_OVERVIEW.md)                         | System introduction, concepts, features  | Everyone                 |
| 02  | [System Design](./02_SYSTEM_DESIGN.md)               | Design decisions, architecture overview  | Backend devs             |
| 03  | [Architecture](./03_ARCHITECTURE.md)                 | Technical architecture, folder structure | Backend devs             |
| 04  | [Database Schema](./04_DATABASE_SCHEMA.md)           | Tables, columns, relationships           | Backend devs, DBAs       |
| 05  | [User Flows](./05_USER_FLOWS.md)                     | Step-by-step user journeys               | Everyone                 |
| 06  | [API Reference](./06_API_REFERENCE.md)               | User endpoint documentation              | Frontend devs            |
| 07  | [Admin API Reference](./07_ADMIN_API_REFERENCE.md)   | Admin endpoint documentation             | Backend devs, Admin devs |
| 08  | [Frontend Integration](./08_FRONTEND_INTEGRATION.md) | React components, examples               | Frontend devs            |
| 09  | [Payment Integration](./09_PAYMENT_INTEGRATION.md)   | Razorpay integration guide               | Full-stack devs          |
| 10  | [Security](./10_SECURITY.md)                         | Auth, RBAC, rate limiting                | Security, Backend devs   |
| 11  | [Error Handling](./11_ERROR_HANDLING.md)             | Error codes, troubleshooting             | Frontend devs, Support   |
| 12  | [Testing Guide](./12_TESTING_GUIDE.md)               | How to test the system                   | QA, Backend devs         |

---

## Key Concepts

| Term            | Definition                                        |
| --------------- | ------------------------------------------------- |
| **Credit**      | Virtual currency unit for applying to projects    |
| **Package**     | Pre-defined bundle of credits with discount       |
| **Transaction** | Record of credit movement (purchase, use, refund) |
| **Balance**     | Current available credits for a user              |

---

## Quick Reference

### Credit Packages

| Package    | Credits | Price (₹) | Discount |
| ---------- | ------- | --------- | -------- |
| Starter    | 10      | 500       | -        |
| Basic      | 25      | 1,125     | 10%      |
| Pro        | 50      | 2,000     | 20%      |
| Enterprise | 100     | 3,500     | 30%      |

### Endpoints at a Glance

```
User Endpoints:
GET  /api/v1/credits/balance
GET  /api/v1/credits/packages
POST /api/v1/credits/initiate-purchase
POST /api/v1/credits/verify-payment
GET  /api/v1/credits/history
GET  /api/v1/credits/refund-eligibility/:id
GET  /api/v1/credits/refunds

Admin Endpoints:
GET  /api/v1/admin/credits/transactions
POST /api/v1/admin/credits/adjust
GET  /api/v1/admin/credits/analytics
GET  /api/v1/admin/credits/user/:id
POST /api/v1/admin/credits/refund-project/:id
GET  /api/v1/admin/credits/export
GET  /api/v1/admin/credits/settings
PUT  /api/v1/admin/credits/settings
```

### Required Permissions

| Action           | Permission             |
| ---------------- | ---------------------- |
| View balance     | `credits.view_own`     |
| Purchase credits | `credits.purchase`     |
| View history     | `credits.view_history` |
| Admin operations | `credits.admin.*`      |

---

## Getting Help

### Common Issues

| Problem                | Solution                       |
| ---------------------- | ------------------------------ |
| "Insufficient credits" | Purchase more credits          |
| "Payment failed"       | Check card details, retry      |
| "Unauthorized"         | Login again, check token       |
| "Forbidden"            | User lacks required permission |

See [Error Handling](./11_ERROR_HANDLING.md) for complete troubleshooting.

### Support

For issues not covered in documentation:

1. Check error response for details
2. Review relevant documentation section
3. Contact backend team with request details

---

## Changelog

### Version 1.0 (December 2024)

- Initial documentation
- Complete API reference
- Frontend integration guide
- Payment integration guide
- Admin features documented
- Security documentation
- Testing guide

---

## Contributing

When updating this documentation:

1. Keep each document focused on its topic
2. Update this README if adding new documents
3. Include code examples where helpful
4. Test all code examples before committing
5. Update "Last Updated" dates
