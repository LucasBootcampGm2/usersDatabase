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

  beforeAll(() => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error("Error connecting to the database:", err.message);
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
              )`
      );
    });
  });

  afterAll(() => {
    db.close();
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
});
