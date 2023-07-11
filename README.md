# User Registration and Profile API

This project implements a RESTful API for user registration, login, password change, and profile retrieval using Node.js, Express, MongoDB, and JWT authentication.

## Features

- User registration: Users can register an account with a username, email, and password. An email confirmation is sent upon registration.
- User login: Registered users can log in using their username and password and receive an access token.
- Password change: Users can change their password by providing their old password and new password.
- Profile retrieval: Users can retrieve their personal information, including username and email.

## Prerequisites

Before running the project, make sure you have the following prerequisites installed:

- Node.js (v12 or higher)
- MongoDB
- NPM or Yarn (package managers)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install the dependencies:

```bash
cd user-registration-api
npm install
```

3. Configure environment variables:

Create a `.env` file in the project root directory and provide the necessary environment variables. Here's an example:

```plaintext
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
EMAIL_USER=<your-email-username>
EMAIL_PASSWORD=<your-email-password>
```

4. Start the server:

```bash
npm run dev
```

The server should start running on `http://localhost:3000`.

## Usage

You can use tools like [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/) to interact with the API endpoints.

### User Registration

- **Endpoint**: `POST /api/register`
- **Headers**: `Content-Type: application/json`
- **Request Body Example**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### User Login

- **Endpoint**: `POST /api/login`
- **Headers**: `Content-Type: application/json`
- **Request Body Example**:
  ```json
  {
    "username": "john_doe",
    "password": "password123"
  }
  ```

### Password Change

- **Endpoint**: `POST /api/actions/changepassword`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer YOUR_TOKEN`
- **Request Body Example**:
  ```json
  {
    "old_password": "old-password",
    "new_password": "new-password"
  }
  ```

### Profile Retrieval

- **Endpoint**: `GET /api/profiles`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer YOUR_TOKEN`

## Contributing

Contributions to this project are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.
