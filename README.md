# Project README: usersDatabase

## Overview

The **usersDatabase** project is a RESTful API built using Node.js and Express, designed to manage user information securely. It allows for user registration, authentication, and role-based authorization, leveraging SQLite as the database for storing user data. The application incorporates security features like password hashing and JSON Web Tokens (JWT) for secure access.

## Project Structure

usersDatabase/
|
├── database/
│ └── users.db3
| └── sqlite.js
|
├── middlewares/
│ └── middlewares.js
|
├── routes/
│ └── users.js
|
├── node_modules
|
├── app.js
|
├── .env
|
├── .gitignore
|
├── package.json
└── package-lock.json

## Key Components

### 1. **users.js**

- **Functionality**: Handles user-related routes, including registration, authentication, and user management.
- **Technologies Used**: Express, Bcrypt for password hashing, JWT for token generation, and SQLite for database interaction.

**Estimated time**: Development time of 2 hours

### 2. **app.js**

- **Functionality**: Entry point of the application, configures middleware, and sets up the server.
- **Technologies Used**: Express, dotenv for environment variable management.

**Estimated Time**: Development time of 15 minutes.

### 3. **middlewares.js**

- **Functionality**: Contains middleware functions for logging requests, error handling, user authentication, and authorization.
- **Technologies Used**: Express middleware functions.

**Estimated Time**: Development time of 1 hour.

### 4. **sqlite.js**

- **Functionality**: Manages the SQLite database connection and initializes the users table with initial data if empty.
- **Technologies Used**: SQLite3 for database management.

**Estimated Cost**: Development time of 30 minutes.

### 5. **users.db3**

- **Functionality**: The SQLite database file that stores user information.

## Installation Instructions

1. **Clone the Repository**:

   git clone <repository-url>
   cd usersDatabase

2. **Install Dependencies**:  
   Ensure you have Node.js installed, then run:

   npm install

3. **Create the `.env` File**:  
   Create a `.env` file in the root directory with the following content:

   PORT=3000
   SECRET_KEY=your_secret_key
   DB_PATH=path_to_your_database/users.db3

4. **Run the Application**:  
   Start the server:

   node app.js

5. **Access the API**:  
   The server will be running at `http://localhost:3000`.

## Usage

- **GET /users**: Retrieve all users (admin access required).
- **GET /users/:id**: Retrieve a specific user by ID.
- **POST /users**: Register a new user.
- **PATCH /users/:id**: Update user information (authenticated users).
- **DELETE /users/:id**: Delete a user (authenticated users).
- **POST /users/login**: Authenticate a user and return a JWT.

## Estimated Total Development

Based on the above estimates:

- **Total Development Time**: 4-5 hours, including details for fun.

## Conclusion

The **usersDatabase** project provides a robust solution for managing user data securely. The implementation leverages modern practices in API development and security, ensuring a reliable user experience.

Feel free to contact me and give me your feedback at: 

**Email**: lucas.berardi@gm2dev.com
