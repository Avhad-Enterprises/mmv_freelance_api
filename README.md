# MMV Freelance API

A comprehensive REST API backend for MMV Freelance Platform built with Node.js, TypeScript, and Express.js using feature-based architecture.

## Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- PostgreSQL database
- AWS S3 bucket
- Firebase project
- Razorpay account

### Installation

```bash
# Clone repository
git clone https://github.com/Avhad-Enterprises/mmv_freelance_api.git
cd mmv_freelance_api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Configure your .env file with database, AWS, Firebase, and Razorpay credentials

# Configure Email Service
# Follow EMAIL_SETUP_GUIDE.md for Gmail SMTP setup
# Required: EMAIL_USER and EMAIL_PASSWORD environment variables

# Build project
npm run build

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run lint         # Code linting
npm run format       # Code formatting
```

## Project Structure

```
src/
├── features/           # Feature-based modules (31 features)
│   ├── user/          # User management
│   ├── project/       # Project operations
│   ├── payment/       # Payment processing
│   └── ...            # Other features
├── database/          # Database schemas
├── middlewares/       # Express middlewares
├── utils/             # Utility functions
├── interfaces/        # TypeScript interfaces
├── exceptions/        # Custom exceptions
└── app.ts            # Express app configuration
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Knex.js
- **Authentication**: JWT + Firebase Admin
- **File Storage**: AWS S3
- **Payment**: Razorpay
- **Email**: Nodemailer
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

ISC License - see LICENSE file for details.