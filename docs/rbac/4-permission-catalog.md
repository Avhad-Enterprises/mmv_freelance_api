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
| `credits.view_own` | View own balance | No |
| `credits.purchase` | Buy credits | No |

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
