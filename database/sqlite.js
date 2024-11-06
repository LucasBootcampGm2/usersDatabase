import sqlite3 from "sqlite3"

const dbPath = process.env.DB_PATH;
const users = JSON.parse(process.env.EXAMPLE_USERS);  


const db = new sqlite3.Database(dbPath, (err) => {
  err
    ? console.error("Error connecting to the database:", err.message)
    : console.log("Connected to the SQLite database.");
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
    `
  );

  db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
    if (err) return console.error(`Error checking users count: ${err.message}`);

    if (row.count === 0) {
      const sql =
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
      const insertStmt = db.prepare(sql);

      users.forEach(({ name, email, password, role }) => {
        insertStmt.run(name, email, password, role);
      });

      insertStmt.finalize((err) => {
        err
          ? console.error("Error inserting initial users:", err)
          : console.log("Initial users loaded successfully");
      });
    } else {
      console.log("The users table is not empty, no initial users added.");
    }
  });
});

export default db;
