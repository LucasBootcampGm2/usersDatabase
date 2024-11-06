import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, process.env.TEST);
const users = JSON.parse(process.env.EXAMPLE_USERS)

describe("SQLite Database Setup", () => {
  let db;

  beforeAll((done) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error connecting to the database:", err.message);
        done(err);
      } else {
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
          const stmt = db.prepare(
            "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
          );

          users.forEach((user) => {
            stmt.run(user);
          });

          stmt.finalize(() => done()); 
        });
      }
    });
  });

  // Cerrar la conexión después de todas las pruebas
  afterAll((done) => {
    db.close((err) => {
      if (err) console.error("Error closing the database:", err.message);
      done(err);
    });
  });

  // Test: Verificar si la tabla users fue creada
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

  // Test: Verificar que los usuarios iniciales fueron insertados
  test("should insert initial users", (done) => {
    db.all("SELECT * FROM users", (err, rows) => {
      expect(err).toBeNull();
      expect(rows.length).toBe(4); // Esperamos 4 usuarios insertados
      done();
    });
  });

  // Test: Verificar que los datos de un usuario son correctos
  test("should have the correct user data", (done) => {
    db.all("SELECT * FROM users", (err, rows) => {
      expect(err).toBeNull();
      const user = rows.find(
        (user) => user.email === "lucas.berardi@gm2dev.com"
      );
      expect(user).toBeDefined();
      expect(user.name).toBe("Lucas");
      expect(user.role).toBe("admin");
      done();
    });
  });
});
