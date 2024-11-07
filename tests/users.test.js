import request from "supertest";
import app from "../app.js";
import db from "../database/sqlite.js";
import jwt from "jsonwebtoken";

beforeAll((done) => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT NOT NULL, 
      email TEXT NOT NULL, 
      password TEXT NOT NULL, 
      role TEXT NOT NULL)`,
      done
    );
  });
});

afterAll((done) => {
  db.run("DELETE FROM users", done);
  db.close(done);
});

let user;
let userToken;

describe("POST /users", () => {
  it("should return a bad request because of wrong password format", async () => {
    const badUser = {
      name: "Nuevo Usuario",
      email: "usuario@prueba.com",
      password: "1212a",
      role: "user",
    };

    await request(app).post("/users").send(badUser).expect(400);
  });

  it("should create a new user", async () => {
    user = {
      name: "Nuevo Usuario",
      email: "usuario@prueba.com",
      password: "1212aA",
      role: "admin",
    };

    const response = await request(app).post("/users").send(user).expect(201);

    user = { id: response.body.id, ...user };
    console.log("USUARRR", user);

    expect(response.body.name).toBe(user.name);
    expect(response.body.email).toBe(user.email);
  });
});

describe("POST /users/login", () => {
  it("should return a user token", async () => {
    const body = {
      email: user.email,
      password: user.password,
    };

    const response = await request(app)
      .post("/users/login")
      .send(body)
      .expect(200);

    userToken = response.body.token;
    expect(userToken).toBeDefined();
    const decodedToken = jwt.verify(userToken, process.env.SECRET_KEY);

    expect(decodedToken.role).toBe(user.role);
    expect(decodedToken.id).toBe(user.id);
  });
});

describe("PUT /users/:id", () => {
  it("should update user data", async () => {
    const body = {
      name: "Lucas Berardi",
      email: "lucascirlloberardi@gm2dev.com",
    };

    const response = await request(app)
      .put(`/users/${user.id}`)
      .set("authorization", `Bearer ${userToken}`)
      .send(body)
      .expect(200);

    expect(response.body.name).toBe(body.name);
    expect(response.body.email).toBe(body.email);
  });

  it("should fail to update user data if email is already taken", async () => {
    const existingUser = {
      name: "Another User",
      email: "lucas.berardi@gm2dev.com",
    };

    await request(app)
      .put(`/users/${user.id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(existingUser)
      .expect(409);
  });
});

describe("GET /users", () => {
  it("should get all users", async () => {
    console.log("get", userToken);

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    console.log(response.body);
  });
});
