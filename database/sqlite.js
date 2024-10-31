import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("./users.db3", (err) => {
  err
    ? console.error("Error opening database:", err.message)
    : console.log("Database opened successfully.");
});

db.serialize(() => {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `,
    (err) => {
      if (err) console.error("Error creating table:", err.message);
    }
  );

  db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
    if (err) {
      console.error("Error checking users count:", err.message);
      return;
    }
    if (row.count === 0) {
      const insertStmt = db.prepare(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
      );
      insertStmt.run("Juan", "juan@example.com", bcrypt.hashSync("password123", 10), "user");
      insertStmt.run("Maria", "maria@example.com", bcrypt.hashSync("password123", 10), "user");
      insertStmt.run("Ariana", "ariana@example.com", bcrypt.hashSync("password123", 10), "admin", (err) => {
        err
          ? console.error("Error inserting initial users:", err.message)
          : console.log("Initial users added successfully.");
      });
      insertStmt.finalize();
    } else {
      console.log("The users table is not empty, no initial users added.");
    }
  });
});

export default db;
