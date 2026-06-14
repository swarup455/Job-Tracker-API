# Job Application Tracker API

A backend REST API built to help job seekers track their job applications and use AI to make the job search process easier. The project covers basic job tracking (create, update, delete, view, stats) along with AI-powered features such as job description summarization, resume vs job description analysis, fake job detection, interview question generation, skill gap roadmap generation, and application message generation.

This is a backend-only project. There is currently no frontend or live deployment. All endpoints have been tested using Postman, and screenshots of the test results are included in this repository.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation and Setup](#installation-and-setup)
- [Running with Docker](#running-with-docker)
- [API Endpoints](#api-endpoints)
- [Caching Strategy](#caching-strategy)
- [Rate Limiting](#rate-limiting)
- [Follow-up Reminder System](#follow-up-reminder-system)
- [API Testing](#api-testing)
- [Author](#author)

## Features

**Authentication**
- User registration and login with JWT stored in HTTP-only cookies
- Password hashing using bcrypt
- Login attempt rate limiting using Redis
- Update profile, reset password, delete account, logout

**Job Tracking**
- Create, read, update, and delete job applications
- Filter jobs by status, source, and search keywords
- Pagination and sorting support
- Job statistics (total jobs, breakdown by source and status)
- Redis caching for job lists, individual jobs, and stats

**AI Features (powered by LangChain and Groq)**
- Upload resume (PDF or DOCX) and extract text
- Summarize a job description from an uploaded file
- Analyze how well a resume matches a job description (match score, strengths, weaknesses, missing skills, suggestions)
- Generate a personalized skill roadmap based on missing skills
- Generate likely interview questions based on resume and job description
- Detect potential job scams based on job description, company name, and job link
- Generate application messages (cold email, LinkedIn message, WhatsApp message, referral request)

**Automated Reminders**
- A cron job runs daily and checks for job applications that were applied to 7 or more days ago with no follow-up sent
- Sends a follow-up reminder email to the user with a list of pending jobs

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis (using ioredis)
- **AI / LLM**: LangChain with Groq (Llama models)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs for password hashing
- **File Handling**: Multer (file uploads), pdf-parse (PDF text extraction), mammoth (DOCX text extraction)
- **Validation**: express-validator
- **Email**: Nodemailer (Gmail SMTP)
- **Scheduling**: node-cron
- **Security**: Helmet, CORS, cookie-parser
- **Logging**: Morgan
- **Containerization**: Docker, Docker Compose

## Project Structure

```
job-tracker-api/
├── src/
│   ├── config/
│   │   ├── db.ts                  # MongoDB connection
│   │   ├── llm.ts                 # Groq LLM configuration
│   │   └── redis.ts               # Redis client configuration
│   ├── controllers/
│   │   ├── aiController.ts        # AI feature controllers
│   │   ├── authController.ts      # Authentication controllers
│   │   └── jobController.ts       # Job CRUD controllers
│   ├── jobs/
│   │   └── reminderCron.ts        # Daily follow-up reminder cron job
│   ├── langchain/
│   │   ├── langchainChains.ts     # All LangChain chains
│   │   ├── langchainParsers.ts    # All output parsers
│   │   └── langchainPrompts.ts    # All prompt templates
│   ├── middlewares/
│   │   ├── authMiddleware.ts      # JWT authentication middleware
│   │   ├── errorMiddleware.ts     # Global error handler
│   │   ├── rateLimitMiddleware.ts # Redis-based rate limiter
│   │   ├── upload.middleware.ts   # Multer configuration
│   │   └── validateMiddleware.ts  # express-validator result handler
│   ├── models/
│   │   ├── job.model.ts           # Job schema
│   │   └── user.model.ts          # User schema
│   ├── routes/
│   │   ├── aiRoutes.ts
│   │   ├── authRoutes.ts
│   │   └── jobRoutes.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── emailService.ts        # Nodemailer email templates and sending logic
│   │   └── reminderService.ts
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types and interfaces
│   ├── utils/
│   │   ├── extractText.ts         # PDF/DOCX text extraction
│   │   ├── generateCacheKey.ts    # Redis cache key generator
│   │   └── generateToken.ts       # JWT token generation
│   ├── validators/
│   │   ├── aiValidator.ts
│   │   ├── authValidator.ts
│   │   └── jobValidator.ts
│   └── app.ts                     # Express app entry point
├── .dockerignore
├── .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/job-tracker

REDIS_HOST=localhost
REDIS_PORT=6379

GROQ_API_KEY=your_groq_api_key

EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

CLIENT_URL=http://localhost:5173
NODE_ENV=development

JWT_SECRET=your_jwt_secret
```

### Notes on environment variables

- `MONGO_URI` should point to your local MongoDB instance or a MongoDB Atlas connection string.
- `REDIS_HOST` and `REDIS_PORT` should point to your local Redis instance (default Redis port is 6379).
- `GROQ_API_KEY` can be obtained for free from [console.groq.com](https://console.groq.com).
- `EMAIL_USER` should be a real Gmail address, and `EMAIL_PASS` should be an App Password generated from your Google Account security settings (2-Step Verification must be enabled first). Do not use your regular Gmail password here.
- `CLIENT_URL` is used for CORS configuration. Set this to the URL of the frontend application if one is built later.
- `JWT_SECRET` should be a long random string used to sign authentication tokens.

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or a MongoDB Atlas connection string)
- Redis (running locally)

### Steps

1. Clone the repository

```
git clone https://github.com/swarup455/Job-Tracker-API.git
cd job-tracker-api
```

2. Install dependencies

```
npm install
```

3. Create a `.env` file in the root directory and fill in the values as described in the [Environment Variables](#environment-variables) section.

4. Start the development server

```
npm run dev
```

The server will start on the port specified in your `.env` file (default: 3000).

### Build for production

```
npm run build
npm start
```

## Running with Docker

This project includes a `Dockerfile` and `docker-compose.yml` that set up the API along with MongoDB and Redis containers.

1. Make sure Docker and Docker Compose are installed.

2. Create a `.env` file as described above. When using Docker Compose, set:

```
MONGO_URI=mongodb://mongo:27017/job-tracker
REDIS_HOST=redis
REDIS_PORT=6379
```

(The service names `mongo` and `redis` are used instead of `localhost` because the containers communicate over the Docker network.)

3. Run the following command from the project root:

```
docker-compose up --build
```

This will start three containers:
- `app` - the Express API (exposed on port 8000)
- `mongo` - MongoDB database (exposed on port 27017)
- `redis` - Redis cache (exposed on port 6379)

To stop the containers:

```
docker-compose down
```

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint           | Description                          | Auth Required |
|--------|--------------------|--------------------------------------|----------------|
| POST   | `/register`        | Register a new user                  | No             |
| POST   | `/login`           | Log in and receive an auth cookie    | No             |
| GET    | `/me`              | Get current logged-in user details   | Yes            |
| PUT    | `/update`          | Update name or resume text           | Yes            |
| PUT    | `/reset-password`  | Change account password              | Yes            |
| POST   | `/logout`          | Log out and clear auth cookie        | Yes            |
| DELETE | `/delete`          | Delete account (requires password)   | Yes            |

### Job Routes (`/api/v1/jobs`)

| Method | Endpoint     | Description                                              | Auth Required |
|--------|--------------|-----------------------------------------------------------|----------------|
| POST   | `/create`    | Create a new job application entry                       | Yes            |
| GET    | `/`          | Get all job applications (supports search, filters, pagination, sorting) | Yes |
| GET    | `/stats`     | Get job application statistics (by source and status)    | Yes            |
| GET    | `/:id`       | Get a single job application by ID                       | Yes            |
| PUT    | `/:id`       | Update a job's status, follow-up status, or notes        | Yes            |
| DELETE | `/:id`       | Delete a job application                                  | Yes            |

#### Query parameters for `GET /jobs`

| Parameter | Description                                  | Example     |
|-----------|-----------------------------------------------|-------------|
| `search`  | Searches by company or role name             | `Google`    |
| `status`  | Filter by application status                 | `Applied`   |
| `source`  | Filter by job source                         | `LinkedIn`  |
| `sortBy`  | Field to sort by                              | `createdAt` |
| `order`   | Sort order (`asc` or `desc`)                 | `desc`      |
| `page`    | Page number                                   | `1`         |
| `limit`   | Number of results per page                   | `10`        |

### AI Routes (`/api/v1/ai`)

| Method | Endpoint               | Description                                                       | Auth Required |
|--------|------------------------|--------------------------------------------------------------------|----------------|
| POST   | `/upload-resume`       | Upload a resume (PDF or DOCX) and extract its text                | Yes            |
| POST   | `/summarize-jd`        | Upload a job description file and get an AI-generated summary    | Yes            |
| POST   | `/analyze-application` | Upload a job description file and compare it with the saved resume | Yes          |
| POST   | `/skill-roadmap`       | Generate a learning roadmap for skills missing from the resume   | Yes            |
| POST   | `/interview-questions` | Generate likely interview questions based on resume and job description | Yes      |
| POST   | `/scam-detection`      | Upload a job description file and check for signs of a job scam  | Yes            |
| POST   | `/generate-message`    | Generate an application message (email, LinkedIn, WhatsApp, referral) | Yes        |

#### Notes on AI routes

- `upload-resume`, `summarize-jd`, `analyze-application`, `skill-roadmap`, `interview-questions`, and `scam-detection` all expect a file upload using `multipart/form-data`. The file field name depends on the route:
  - `upload-resume` expects a field named `resume`
  - all other routes that take a job description file expect a field named `jobDescription`
- `analyze-application`, `skill-roadmap`, and `interview-questions` require that `summarize-jd` (and, where applicable, `analyze-application`) has already been called for the same job description, since these endpoints rely on cached results from earlier steps.
- `scam-detection` also accepts optional `company` and `jobLink` text fields in the form data.
- `generate-message` expects a JSON body:

```json
{
  "type": "cold-email",
  "company": "Google",
  "role": "Software Engineer",
  "recipientName": "Sarah Johnson"
}
```

`type` must be one of: `linkedin`, `cold-email`, `whatsapp`, `referral`. `recipientName` is optional.

## Caching Strategy

Redis is used throughout this project to reduce database load and avoid unnecessary calls to the Groq API.

- **Job lists** (`GET /jobs`) are cached per user based on the combination of search, filter, sort, and pagination parameters. Cached for 5 minutes.
- **Single job** (`GET /jobs/:id`) is cached per user and job ID. Cached for 5 minutes.
- **Job statistics** (`GET /jobs/stats`) are cached per user. Cached for 5 minutes.
- Whenever a job is created, updated, or deleted, the relevant cache keys (job lists, single job, and stats) are invalidated for that user.
- **AI results** (job description summary, application analysis, skill roadmap, interview questions, scam detection, application messages) are cached per user based on a combination of user ID and the content being processed. This avoids repeated LLM calls for the same input and helps stay within the Groq free tier limits. Cached for 5 minutes.
- The `analyze-application`, `skill-roadmap`, and `interview-questions` endpoints depend on results cached from earlier steps (`summarize-jd` and `analyze-application` respectively), so these endpoints must be called in sequence for the same job description.

## Rate Limiting

A custom Redis-based rate limiter is applied to all AI routes to avoid exceeding the Groq free tier's request limits.

- The limiter uses Redis `INCR` and `EXPIRE` commands to track the number of requests made by each user within a time window.
- The rate limit key is based on the user's ID (falling back to IP address if the user is not authenticated).
- If a user exceeds the allowed number of requests within the time window, the API responds with a `429 Too Many Requests` status and the number of seconds remaining until the limit resets.
- A separate Redis-based attempt counter is also used on the login route to limit repeated failed login attempts (maximum 5 attempts within 15 minutes).

## Follow-up Reminder System

A daily cron job (using `node-cron`) checks the database for job applications that meet the following conditions:

- Status is `Applied`
- `followUpSent` is `false`
- `appliedAt` date is 7 or more days in the past

For each user with matching jobs, the system sends a single email listing all the jobs that are due for a follow-up. The email is sent using Nodemailer through Gmail SMTP, and is formatted as an HTML table showing the company name, role, applied date, and current status for each job.

After the email is sent, the `followUpSent` field for each included job is updated to `true` so the same reminder is not sent again.

## API Testing

This project does not currently have an automated test suite. All endpoints were manually tested using Postman during development.

A PDF containing screenshots of Postman requests and responses for each endpoint is included in this repository ([JobTracker-PostmanTesting-Screenshots.pdf](./public/JobTracker-PostmanTesting-Screenshots.pdf)). It covers:

- User registration and login
- Fetching current user details
- Creating a job application
- Listing jobs with pagination
- Fetching job statistics
- Uploading a resume
- Summarizing a job description
- Analyzing a resume against a job description
- Generating a skill roadmap
- Generating interview questions
- Detecting a potential job scam
- Generating an application message

To test the API yourself:

1. Start the server (locally or with Docker)
2. Open Postman and create an environment variable `base_url` set to `http://localhost:3000/api/v1` (or `http://localhost:8000/api/v1` if using Docker)
3. Register a user, log in (this stores the auth cookie in Postman's cookie jar), and then test the remaining endpoints in the order listed above

## Author

**Swarup Das**

- GitHub: [@swarup455](https://github.com/swarup455)
- Email: swarup82546@gmail.com
