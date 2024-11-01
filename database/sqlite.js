import sqlite3 from "sqlite3";
import dotenv from "dotenv";

dotenv.config();
const dbPath = process.env.DB_PATH;

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
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
      const inserStmt = db.prepare(
        `INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`
      );

      inserStmt.run(
        "Lucas",
        "lucas.berardi@gm2dev.com",
        "$2y$10$F61Yn7DNf4e.0XQBZykxr.gzo5uA75rgtuYx.gTptiZB9JuWoWWc6",
        "admin"
      );
      inserStmt.run(
        "Matias",
        "matias.berardi@gm2dev.com",
        "$2y$10$Glb0q0gjhqA/m6fxW9sWPePsOkyGbALrqKzIWO4OUr2PRR4KZC0ky",
        "user"
      );
      inserStmt.run(
        "Jorge",
        "jorge.berardi@gm2dev.com",
        "$2y$10$4jW0WH4dM1UfR2ba.yfMAuIn6.AsY8KYnnRabwmZDWRYvYM4ONf7y",
        "user"
      );
      inserStmt.run(
        "martin",
        "martin.berardi@gm2dev.com",
        "$2y$10$wK5HB9vzu5NKCAiTYbl1lOKKa3DfvtGXQjL110wLNlnauOl/wgTTG",
        "user",
        (err) => {
          if (err) {
            console.error("Error inserting initial users");
          } else {
            console.log("Initial users loaded successfully");
          }
        }
      );
      inserStmt.finalize();
    } else {
      console.log("The users table is not empty, no initial users added.");
    }
  });
});

export default db;
