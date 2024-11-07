import request from "supertest";
import app from "../../app.js"; 

describe("Users API", () => {
  it("should fetch all users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", "Bearer fake-token")
      .expect(403);
  });

  it("should create a new user", async () => {
    const newUser = {
      name: "Juan Perez",
      email: "juansee.perez@example.com",
      password: "Password123",
      role: "user",
    };

    const response = await request(app)
      .post("/users")
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty("id"); 
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.email).toBe(newUser.email);
  });
});
