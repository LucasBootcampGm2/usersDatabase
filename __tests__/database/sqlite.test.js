import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const file = process.env.TEST_DB_PATH;
const dbPath = path.join(__dirname, file);

describe("SQLite Database Setup", () => {
  let db;

  beforeAll((done) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error connecting to the database:", err.message);
        done(err);
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
      `,
        (err) => {
          if (err) {
            console.error("Error creating table:", err.message);
            done(err);
          }
        }
      );

      db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
        if (err)
          return console.error(`Error checking users count: ${err.message}`);

        if (row.count === 0) {
          const users = JSON.parse(process.env.EXAMPLE_USERS);

          const sql =
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
          const insertStmt = db.prepare(sql);

          users.forEach(({ name, email, password, role }) => {
            insertStmt.run(name, email, password, role);
          });

          insertStmt.finalize((err) => {
            if (err) {
              console.error("Error inserting initial users:", err);
              done(err);
            } else {
              console.log("Initial users loaded successfully");
              done();
            }
          });
        } else {
          console.log("The users table is not empty, no initial users added.");
          done();
        }
      });
    });
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          console.error("Error closing the database:", err.message);
          reject(err);
        } else {
          console.log("Database connection closed.");
          resolve();
        }
      });
    });
  });

  test("should create the users table", (done) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users';",
      (err, row) => {
        expect(err).toBeNull();
        expect(row).not.toBeUndefined();
        expect(row.name).toBe("users");
        done();
      }
    );
  });

  test("should insert initial users", (done) => {
    db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
      expect(err).toBeNull();
      expect(row.count).toBeGreaterThan(0);
      done();
    });
  });

  test("should have the correct user data", (done) => {
    const expectedUser = {
      name: "Lucas",
      email: "lucas.berardi@gm2dev.com",
      role: "admin",
    };

    db.get(
      "SELECT * FROM users WHERE email = ?",
      [expectedUser.email],
      (err, row) => {
        expect(err).toBeNull();
        expect(row).toBeDefined();
        expect(row.name).toBe(expectedUser.name);
        expect(row.role).toBe(expectedUser.role);
        done();
      }
    );
  });
});
