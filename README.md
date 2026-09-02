# Personal Finance Management Application - Backend

This is the backend API for the Personal Finance Management Application. It provides a secure, RESTful interface for user authentication, transaction management, and dashboard summaries, ensuring that users have full ownership and privacy over their financial data.

## Technologies Used

- **Node.js**
- **Express.js** (v5.2.1)
- **JavaScript (ES Modules)**
- **MongoDB** (via Mongoose v9.9.4)
- **JWT (JSON Web Tokens)** (jsonwebtoken v9.0.3)
- **bcryptjs** (v3.0.3)
- **dotenv** (v17.4.2)
- **cors** (v2.8.6)

## Prerequisites

- Node.js (v16+ recommended)
- npm
- MongoDB (Local instance or MongoDB Atlas cluster)

## Installation

1. Clone the repository.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root of the `backend` directory. The following variables are required:

- `PORT`: The port number the server will listen on.
- `MONGODB_URI`: The connection string for your MongoDB database (e.g., local or MongoDB Atlas).
- `JWT_SECRET`: A secure, random string used to sign JSON Web Tokens.

**Example `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_manager
JWT_SECRET=your_super_secret_jwt_key
```

## Database Setup

The application connects to MongoDB using Mongoose. Ensure your MongoDB instance is running before starting the server. If using MongoDB Atlas, replace the `MONGODB_URI` with your cluster connection string. The application will automatically create the necessary collections (`users`, `transactions`) upon the first respective inserts. There are no manual seeding requirements.

## Running the Backend

Start the server in development mode (using nodemon for hot-reloading):
```bash
npm run dev
```

Start the server in production mode:
```bash
npm start
```

## API Overview

| Method | Endpoint | Authentication | Purpose |
|--------|----------|----------------|---------|
| **Authentication** | | | |
| POST | `/api/auth/register` | Public | Register a new user account |
| POST | `/api/auth/login` | Public | Authenticate a user and receive a JWT |
| **Transactions** | | | |
| POST | `/api/transactions` | Bearer Token | Create a new transaction |
| GET | `/api/transactions` | Bearer Token | Retrieve all transactions (supports searching by description, and filtering by category/type/sort/limit) |
| GET | `/api/transactions/:id` | Bearer Token | Retrieve a single transaction by ID |
| PATCH | `/api/transactions/:id` | Bearer Token | Update an existing transaction by ID |
| DELETE | `/api/transactions/:id` | Bearer Token | Delete a transaction by ID |
| **Dashboard** | | | |
| GET | `/api/dashboard/summary` | Bearer Token | Get income, expense, and balance summaries (supports 7 Days, 30 Days, All) |
| GET | `/api/dashboard/trends` | Bearer Token | Get aggregated daily trend data for charts |

## Authentication & Security

The backend secures endpoints using **JWT Authentication**.
- **Bearer Token**: Upon a successful login, the server issues a JWT. The client must include this token in the `Authorization` header as `Bearer <token>` for protected routes.
- **Transaction Ownership**: All transaction requests are strictly filtered by the authenticated user's ID (`req.user.id` derived from the JWT). Users can never access, edit, or delete transactions belonging to another user.
- **Password Security**: Passwords are securely hashed using `bcryptjs` before being stored in the database.

## Validation

The API enforces strict validation rules before processing requests:
- **Required Fields**: Ensures fields like `title`, `amount`, `category`, `type`, and `date` are provided.
- **Data Integrity**: The `amount` must be strictly positive (> 0). The `type` must be exactly `"income"` or `"expense"`.
- **Date Constraints**: Transaction dates cannot be in the future.
- **Title Limitations**: The `title` field cannot be empty, consists only of whitespace, or exceed 100 characters.

## Project Structure

```text
backend/
├── package.json
├── src/
│   ├── app.js                 # Express app configuration & middleware
│   ├── server.js              # Database connection & server entry point
│   ├── controllers/           # Route logic (auth, dashboard, transactions)
│   ├── middlewares/           # Custom middlewares (authMiddleware)
│   ├── models/                # Mongoose schemas (User, Transaction)
│   └── routes/                # Express router definitions
```

## Documentation

| Document | Link |
|----------|------|
| Requirement Analysis | [View Document](https://drive.google.com/file/d/1czd4oegahKemJ-k9XuJNfwquQYsogE9r/view?usp=sharing) |
| Functional Requirements | [View Document](https://drive.google.com/file/d/1ChIJqadF76e126xwj1uhUXvjQ0T-hB-b/view?usp=sharing) |
| Non Functional Requirements | [View Document](https://drive.google.com/file/d/1ChIJqadF76e126xwj1uhUXvjQ0T-hB-b/view?usp=sharing) |
| Problem Analysis | [View Document](https://drive.google.com/file/d/1lUPShsE2vqiRr4vmOwAsjqNBdkf5wCYz/view?usp=sharing) |
| API Documentation | [View Document](https://drive.google.com/file/d/1ChIJqadF76e126xwj1uhUXvjQ0T-hB-b/view?usp=sharing) |
| System Architecture | [View Diagram](https://drive.google.com/file/d/1UoyZrus6nmlRQK7pTEa7nDxhRS4DqGCL/view?usp=sharing) |
| Database Design | [View Diagram](https://drive.google.com/file/d/1nrAejrDzX1Bnmgr9yVf2DjQggGVsfWne/view?usp=sharing) |
