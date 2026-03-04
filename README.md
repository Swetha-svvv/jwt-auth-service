# Secure JWT Authentication Service with RSA Encryption

## Overview

This project implements a secure, stateless authentication API using **JSON Web Tokens (JWT)** with **RSA (RS256) asymmetric encryption**.
It demonstrates best practices for authentication including password hashing, token lifecycle management, refresh tokens, and rate limiting.

The entire system is containerized using **Docker and Docker Compose**, ensuring a consistent environment for development and evaluation.

---

# Features

* JWT authentication using **RSA-2048 (RS256)**
* **Access tokens** with 15-minute expiration
* **Refresh tokens** valid for 7 days
* Secure password hashing using **bcrypt**
* **Rate limiting** protection for login endpoint
* Protected API routes using JWT middleware
* Token verification endpoint
* Logout functionality with refresh token revocation
* PostgreSQL database for user and token storage
* Fully containerized environment using Docker

---

# Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Docker & Docker Compose
* OpenSSL
* bcrypt
* JSON Web Tokens (JWT)

---

# Project Structure

```
jwt-auth-service
│
├── src/
│   ├── db/
│   ├── routes/
│   ├── middleware/
│   └── untils/ 
│
├── Dockerfile
├── docker-compose.yml
├── generate-keys.sh
├── test-auth-flow.sh
├── .env.example
├── tsconfig.json
└── README.md
└── screenshots
```

---

# Environment Variables

Create a `.env` file based on `.env.example`.

Example configuration:

```
API_PORT=5000
DATABASE_URL=postgresql://postgres:postgres@db:5432/mydb
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem

DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mydb
```

---

# RSA Key Generation

Generate the RSA-2048 key pair used for signing and verifying JWT tokens.

```
./generate-keys.sh
```

This will create:

```
keys/private.pem
keys/public.pem
```

⚠️ These keys are excluded from version control via `.gitignore`.

---

# Running the Application

Start all services using Docker Compose:

```
docker-compose up --build
```

This will start:

* Application server
* PostgreSQL database

The API will be available at:

```
http://localhost:5000
```

---

# Database Schema

## users

| Column        | Type         | Constraints     |
| ------------- | ------------ | --------------- |
| id            | SERIAL       | PRIMARY KEY     |
| username      | VARCHAR(255) | UNIQUE NOT NULL |
| email         | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL        |
| created_at    | TIMESTAMP    | DEFAULT NOW()   |

## refresh_tokens

| Column     | Type         | Constraints           |
| ---------- | ------------ | --------------------- |
| id         | SERIAL       | PRIMARY KEY           |
| user_id    | INTEGER      | FOREIGN KEY users(id) |
| token      | VARCHAR(512) | UNIQUE NOT NULL       |
| expires_at | TIMESTAMP    | NOT NULL              |
| created_at | TIMESTAMP    | DEFAULT NOW()         |

---

# API Endpoints

## Register User

```
POST /auth/register
```

Example request:

```
{
 "username": "swetha",
 "email": "swetha@test.com",
 "password": "Pass@123"
}
```

---

## Login

```
POST /auth/login
```

Response:

```
{
 "token_type": "Bearer",
 "access_token": "...",
 "expires_in": 900,
 "refresh_token": "..."
}
```

---

## Refresh Access Token

```
POST /auth/refresh
```

---

## Protected Profile Endpoint

```
GET /api/profile
```

Header:

```
Authorization: Bearer <access_token>
```

---

## Verify Token

```
GET /api/verify-token?token=<access_token>
```

---

## Logout

```
POST /auth/logout
```

---

# Rate Limiting

The login endpoint is protected with rate limiting:

* Maximum **5 login attempts per minute per IP**
* Additional requests return **429 Too Many Requests**

---

# Testing the Authentication Flow

Run the automated test script:

```
./test-auth-flow.sh
```

This script performs the following actions:

1. Registers a new user
2. Logs in and retrieves tokens
3. Calls the protected profile endpoint
4. Refreshes the access token
5. Logs out

Successful execution will display:

```
Flow completed.
```

---

# Security Best Practices Implemented

* RSA-2048 asymmetric JWT signing
* Password hashing using bcrypt
* Secure refresh token storage
* Token expiration enforcement
* Login rate limiting
* Private keys excluded from version control

---

# Author

Swetha
B.Tech Student
