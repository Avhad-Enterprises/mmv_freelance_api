# System Permission Catalog

A reference list of all available permissions in the system, grouped by module.

## 👥 User Management (`users.*`)
| Permission | Description | Critical? |
| :--- | :--- | :--- |
| `users.view` | View user profiles | No |
| `users.create` | Create new users | **Yes** |
| `users.update` | Update profiles | No |
| `users.delete` | Delete accounts | **Yes** |
| `users.ban` | Ban/Unban users | **Yes** |

## 📂 Project Management (`projects.*` | `applications.*`)
| Permission | Description |
| :--- | :--- |
| `projects.view` | View projects |
| `projects.create` | Create projects (Clients) |
| `projects.update` | Update projects |
| `projects.delete` | Delete projects |
| `projects.apply` | Apply to projects (Freelancers) |
| `projects.withdraw` | Withdraw application |
| `projects.hire` | Hire a freelancer |
| `applications.view` | View received applications |

## 💳 Financials (`payments.*` | `credits.*`)
| Permission | Description | Critical? |
| :--- | :--- | :--- |
| `payments.view` | View transactions | No |
| `payments.process` | Process payouts | **Yes** |

### Credits - Freelancer Permissions
| Permission | Description | Roles |
| :--- | :--- | :--- |
| `credits.view_own` | View own balance | VIDEOGRAPHER, VIDEO_EDITOR |
| `credits.purchase` | Buy credits | VIDEOGRAPHER, VIDEO_EDITOR |
| `credits.view_packages` | View available packages | VIDEOGRAPHER, VIDEO_EDITOR |
| `credits.view_history` | View transaction history | VIDEOGRAPHER, VIDEO_EDITOR |
| `credits.request_refund` | Check refund eligibility | VIDEOGRAPHER, VIDEO_EDITOR |

### Credits - Admin Permissions
| Permission | Description | Critical? |
| :--- | :--- | :--- |
| `credits.admin.view_all` | View all transactions | No |
| `credits.admin.adjust` | Add/deduct credits | **Yes** |
| `credits.admin.analytics` | View credit analytics | No |
| `credits.admin.refund` | Process project refunds | **Yes** |
| `credits.admin.export` | Export transactions | No |

## 📝 Content Management (`content.*`)
| Permission | Description |
| :--- | :--- |
| `content.create` | Create blog/CMS pages |
| `content.publish` | Publish content live |
| `content.delete` | Delete content |

## ⚙️ Admin (`admin.*` | `reports.*`)
| Permission | Description | Critical? |
| :--- | :--- | :--- |
| `admin.dashboard` | Access Dashboard | No |
| `admin.settings` | Change system config | **Yes** |
| `admin.roles` | Manage Roles/Permissions | **Yes** |
| `reports.view` | View System Analytics | No |

## ⭐ Reviews (`reviews.*`)
| Permission | Description |
| :--- | :--- |
| `reviews.create` | Write a review |
| `reviews.moderate` | Hide/Flag reviews |

## 🎫 Support (`support.*`)
| Permission | Description |
| :--- | :--- |
| `support.create` | Open ticket |
| `support.resolve` | Close/Resolve ticket |
