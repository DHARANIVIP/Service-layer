# Authentication Service Layer

A complete Node.js authentication service with OTP verification, password reset, and JWT-based authentication.

## Features

- ✅ User Registration with Email OTP Verification
- ✅ User Login with JWT Authentication
- ✅ Forgot Password with OTP
- ✅ Reset Password
- ✅ Resend OTP
- ✅ Protected Routes with JWT Middleware
- ✅ MongoDB Atlas Integration
- ✅ Email Service with HTML Templates

## Project Structure

```
service-layer/
├── config/              # Configuration files
│   └── db.js            # MongoDB Atlas connection
├── controllers/         # Business logic
│   └── authController.js# Authentication logic
├── middlewares/         # Custom middleware
│   └── authMiddleware.js# JWT verification
├── models/              # Database schemas
│   └── User.js          # User model
├── routes/              # API routes
│   └── authRoutes.js    # Authentication routes
├── utils/               # Helper functions
│   ├── sendEmail.js     # Email service
│   └── otpGenerator.js  # OTP generation
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
├── index.js            # Server entry point
└── package.json        # Dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file with your actual credentials:

```env
# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_strong_secret_key

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `EMAIL_PASS`

### 3. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/verify-otp` | Verify email with OTP |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| POST | `/api/auth/resend-otp` | Resend verification OTP |

### Protected Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/profile` | Get user profile | ✅ Bearer Token |

## API Usage Examples

### 1. Signup

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your email.",
  "data": {
    "userId": "...",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### 2. Verify OTP

```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

### 3. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Access Protected Route

```bash
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Forgot Password

```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### 6. Reset Password

```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ OTP expiration (10 minutes default)
- ✅ Protected routes with middleware
- ✅ Input validation
- ✅ Secure password storage (never returned in responses)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Email Service:** Nodemailer
- **Validation:** express-validator
- **Environment Variables:** dotenv

## Development

The project uses `nodemon` for development. Any changes will automatically restart the server.

```bash
npm run dev
```

## Testing

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL commands
- Any HTTP client

## Notes

- Make sure MongoDB Atlas allows connections from your IP
- Never commit the `.env` file to version control
- Use strong JWT secrets in production
- Configure CORS settings for production use
- Set appropriate rate limiting for production

## License

ISC
