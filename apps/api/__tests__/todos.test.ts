import request from "supertest";
import { app } from "../src/app";
import { resetStore } from "../src/store";
import { resetUsers } from "../src/authStore";

let authToken: string;
let secondUserToken: string;

beforeEach(async () => {
  resetStore();
  resetUsers();
  const loginRes = await request(app)
    .post("/auth/register")
    .send({ email: "test@example.com", password: "password123", name: "Test User" });
  authToken = loginRes.body.token;
  const secondRes = await request(app)
    .post("/auth/register")
    .send({ email: "second@example.com", password: "password123", name: "Second User" });
  secondUserToken = secondRes.body.token;
});

describe("POST /auth/register", () => {
  it("creates user with valid credentials", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "new@example.com", password: "password123", name: "New User" });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("new@example.com");
    expect(res.body.user.name).toBe("New User");
    expect(res.body.token).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ password: "password123", name: "Test" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email, password, and name are required");
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@example.com", name: "Test" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email, password, and name are required");
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@example.com", password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email, password, and name are required");
  });

  it("returns 400 when password is less than 6 characters", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "shortpw@example.com", password: "12345", name: "Test" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Password must be at least 6 characters");
  });

  it("returns 201 when password is exactly 6 characters", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "sixpw@example.com", password: "123456", name: "Test" });
    expect(res.status).toBe(201);
  });

  it("returns 400 when email is already registered", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "duplicate@example.com", password: "password123", name: "First" });
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "duplicate@example.com", password: "password123", name: "Second" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("User already exists");
  });

  it("handles empty body", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email, password, and name are required");
  });

  it("accepts random extra fields in body", async () => {
    resetUsers();
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "extra@example.com", password: "password123", name: "Test", foo: "bar" });
    expect(res.status).toBe(201);
  });
});

describe("POST /auth/login", () => {
  beforeEach(async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "login@example.com", password: "password123", name: "Login User" });
  });

  it("logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("login@example.com");
    expect(res.body.token).toBeDefined();
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email and password are required");
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email and password are required");
  });

  it("returns 401 when email does not exist", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nonexistent@example.com", password: "password123" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns 401 when password is incorrect", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@example.com", password: "wrongpassword" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("handles empty body", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email and password are required");
  });
});

describe("Authentication middleware", () => {
  it("returns 401 when authorization header is missing on GET /todos", async () => {
    const res = await request(app).get("/todos");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 401 when authorization header is missing on POST /todos", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "Test" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 401 when authorization header is missing on PATCH /todos/1", async () => {
    const res = await request(app)
      .patch("/todos/1")
      .send({ completed: true });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 401 when authorization header is missing on DELETE /todos/1", async () => {
    const res = await request(app).delete("/todos/1");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 401 when authorization header does not start with Bearer", async () => {
    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Basic ${authToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 401 when token is invalid", async () => {
    const res = await request(app)
      .get("/todos")
      .set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 401 when token is malformed", async () => {
    const res = await request(app)
      .get("/todos")
      .set("Authorization", "Bearer xyz123");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 401 when token is empty string", async () => {
    const res = await request(app)
      .get("/todos")
      .set("Authorization", "Bearer ");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("returns 401 when user is deleted but token is still valid", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "todelete@example.com", password: "password123", name: "Delete Me" });
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "todelete@example.com", password: "password123" });
    const token = loginRes.body.token;
    resetUsers();
    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("allows fresh registration after reset", async () => {
    resetUsers();
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "fresh@example.com", password: "password123", name: "Fresh User" });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("fresh@example.com");
  });
});

describe("GET /todos", () => {
  it("returns empty array initially", async () => {
    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns todos with correct structure", async () => {
    await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Test todo", description: "Description" });
    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("title");
    expect(res.body[0]).toHaveProperty("completed");
    expect(res.body[0]).toHaveProperty("createdAt");
    expect(res.body[0]).not.toHaveProperty("passwordHash");
  });

  it("returns todos in order of creation", async () => {
    await request(app).post("/todos").set("Authorization", `Bearer ${authToken}`).send({ title: "First" });
    await request(app).post("/todos").set("Authorization", `Bearer ${authToken}`).send({ title: "Second" });
    await request(app).post("/todos").set("Authorization", `Bearer ${authToken}`).send({ title: "Third" });
    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.body[0].title).toBe("First");
    expect(res.body[1].title).toBe("Second");
    expect(res.body[2].title).toBe("Third");
  });
});

describe("POST /todos", () => {
  it("creates todo with only title", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Title only" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Title only");
    expect(res.body.description).toBeUndefined();
    expect(res.body.completed).toBe(false);
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it("creates todo with title and description", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "With description", description: "Some description text" });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe("Some description text");
  });

  it("trims title whitespace", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "  Spaced title  " });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Spaced title");
  });

  it("returns 400 when title is only spaces", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "     " });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("returns 400 when title is empty string", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ description: "Only description" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("returns 400 when title is null", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: null });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("returns 400 when title is undefined", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: undefined });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("returns 400 when title is a number", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: 123 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("returns 400 when title is an array", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: ["array", "title"] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("returns 400 when title is an object", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: { text: "object title" } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("returns 400 when title is boolean", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: true });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("handles empty body", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });

  it("handles title with newlines", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Line1\nLine2" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Line1\nLine2");
  });

  it("handles title with tabs", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Tab\ttitle" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Tab\ttitle");
  });

  it("handles unicode title", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Unicode: \u00e9\u00e8\u00ea" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Unicode: \u00e9\u00e8\u00ea");
  });

  it("handles emoji in title", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Todo with emoji 🎉" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Todo with emoji 🎉");
  });

  it("handles description with unicode", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Title", description: "Description \u00e9\u00e8" });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe("Description \u00e9\u00e8");
  });

  it("handles description with emoji", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Title", description: "Emoji description 📚" });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe("Emoji description 📚");
  });

  it("handles very long title", async () => {
    const longTitle = "a".repeat(10000);
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: longTitle });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(longTitle);
  });

  it("handles very long description", async () => {
    const longDesc = "a".repeat(10000);
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Title", description: longDesc });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe(longDesc);
  });

  it("handles description as number", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Title", description: 123 });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe(123);
  });

  it("ignores extra fields in body", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Title", foo: "bar", baz: 123 });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Title");
    expect(res.body.foo).toBeUndefined();
  });

  it("assigns sequential IDs", async () => {
    const res1 = await request(app).post("/todos").set("Authorization", `Bearer ${authToken}`).send({ title: "First" });
    const res2 = await request(app).post("/todos").set("Authorization", `Bearer ${authToken}`).send({ title: "Second" });
    const res3 = await request(app).post("/todos").set("Authorization", `Bearer ${authToken}`).send({ title: "Third" });
    expect(res1.body.id).toBe(1);
    expect(res2.body.id).toBe(2);
    expect(res3.body.id).toBe(3);
  });

  it("sets createdAt as ISO string", async () => {
    const before = new Date().toISOString();
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Test" });
    const after = new Date().toISOString();
    expect(res.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    expect(res.body.createdAt >= before).toBe(true);
    expect(res.body.createdAt <= after).toBe(true);
  });

  it("newly created todo has completed set to false regardless of input", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Test", completed: true });
    expect(res.status).toBe(201);
    expect(res.body.completed).toBe(false);
  });
});

describe("PATCH /todos/:id", () => {
  let todoId: number;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Test todo" });
    todoId = createRes.body.id;
  });

  it("updates completed to true", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("updates completed to false", async () => {
    await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: false });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it("returns 400 when completed is string 'true'", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: "true" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Completed must be a boolean");
  });

  it("returns 400 when completed is string 'false'", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: "false" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Completed must be a boolean");
  });

  it("returns 400 when completed is number 1", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Completed must be a boolean");
  });

  it("returns 400 when completed is number 0", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Completed must be a boolean");
  });

  it("returns 400 when completed is null", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: null });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Completed must be a boolean");
  });

  it("returns 400 when completed is undefined", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: undefined });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Completed must be a boolean");
  });

  it("returns 400 when completed is an object", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: { value: true } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Completed must be a boolean");
  });

  it("returns 400 when completed is an array", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: [true] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Completed must be a boolean");
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Completed must be a boolean");
  });

  it("returns 400 for non-numeric id", async () => {
    const res = await request(app)
      .patch("/todos/abc")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid id");
  });

  it("parses numeric prefix from id with trailing characters", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}abc`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(todoId);
  });

  it("returns 404 for negative id", async () => {
    const res = await request(app)
      .patch("/todos/-1")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Todo not found");
  });

  it("returns 404 for zero id", async () => {
    const res = await request(app)
      .patch("/todos/0")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Todo not found");
  });

  it("parses float id as integer (truncates)", async () => {
    const res = await request(app)
      .patch("/todos/1.9")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it("returns 404 for id that does not exist", async () => {
    const res = await request(app)
      .patch("/todos/99999")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Todo not found");
  });

  it("returns 404 for deleted todo", async () => {
    await request(app)
      .delete(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`);
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Todo not found");
  });

  it("does not modify title when updating completed", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.body.title).toBe("Test todo");
  });

  it("does not modify description when updating completed", async () => {
    const createRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "With desc", description: "Original desc" });
    const id = createRes.body.id;
    const res = await request(app)
      .patch(`/todos/${id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.body.description).toBe("Original desc");
  });

  it("allows multiple updates to same todo", async () => {
    await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: false });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it("ignores extra fields in body", async () => {
    const res = await request(app)
      .patch(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true, title: "Changed", description: "Also changed" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Test todo");
    expect(res.body.description).toBeUndefined();
  });
});

describe("DELETE /todos/:id", () => {
  let todoId: number;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "To delete" });
    todoId = createRes.body.id;
  });

  it("deletes todo and returns 204", async () => {
    const res = await request(app)
      .delete(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it("deleted todo no longer appears in list", async () => {
    await request(app)
      .delete(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`);
    const getRes = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(getRes.body).toHaveLength(0);
  });

  it("returns 404 when trying to delete already deleted todo", async () => {
    await request(app)
      .delete(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`);
    const res = await request(app)
      .delete(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Todo not found");
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app)
      .delete("/todos/99999")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Todo not found");
  });

  it("returns 400 for invalid id format", async () => {
    const res = await request(app)
      .delete("/todos/invalid")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid id");
  });

  it("returns 404 for negative id", async () => {
    const res = await request(app)
      .delete("/todos/-1")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Todo not found");
  });

  it("returns 404 for zero id", async () => {
    const res = await request(app)
      .delete("/todos/0")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Todo not found");
  });

  it("other todos remain after deleting one", async () => {
    await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Keep me" });
    await request(app)
      .delete(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`);
    const getRes = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(getRes.body).toHaveLength(1);
    expect(getRes.body[0].title).toBe("Keep me");
  });
});

describe("404 handler", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await request(app)
      .get("/unknown")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });

  it("returns 404 for unknown routes without auth", async () => {
    const res = await request(app).get("/unknown");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });

  it("returns 404 for /todos with wrong method", async () => {
    const res = await request(app)
      .put("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Test" });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });
});

describe("Response headers", () => {
  it("returns CORS headers", async () => {
    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });

  it("Content-Type is application/json", async () => {
    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});

describe("Concurrent operations", () => {
  it("handles rapid create operations", async () => {
    const promises = Array(10).fill(null).map((_, i) =>
      request(app)
        .post("/todos")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: `Todo ${i}` })
    );
    const results = await Promise.all(promises);
    results.forEach(res => expect(res.status).toBe(201));
    const getRes = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(getRes.body).toHaveLength(10);
  });

  it("handles create then immediate delete", async () => {
    const createRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Quick delete" });
    const id = createRes.body.id;
    const delRes = await request(app)
      .delete(`/todos/${id}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(delRes.status).toBe(204);
    const getRes = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(getRes.body).toHaveLength(0);
  });

  it("handles create then immediate update", async () => {
    const createRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Quick update" });
    const id = createRes.body.id;
    const updateRes = await request(app)
      .patch(`/todos/${id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.completed).toBe(true);
  });

  it("handles update then delete", async () => {
    const createRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Update then delete" });
    const id = createRes.body.id;
    await request(app)
      .patch(`/todos/${id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    const delRes = await request(app)
      .delete(`/todos/${id}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(delRes.status).toBe(204);
  });

  it("handles delete then get", async () => {
    const createRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Delete then get" });
    const id = createRes.body.id;
    await request(app)
      .delete(`/todos/${id}`)
      .set("Authorization", `Bearer ${authToken}`);
    const getRes = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(getRes.body).toHaveLength(0);
  });

  it("handles update non-existent todo", async () => {
    const res = await request(app)
      .patch("/todos/12345")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ completed: true });
    expect(res.status).toBe(404);
  });

  it("handles delete non-existent todo", async () => {
    const res = await request(app)
      .delete("/todos/12345")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});

describe("Reset functionality", () => {
  it("resetStore clears all todos and resets id counter", async () => {
    await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Todo 1" });
    await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Todo 2" });

    resetStore();

    const res = await request(app)
      .get("/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.body).toHaveLength(0);

    const createRes = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "After reset" });
    expect(createRes.body.id).toBe(1);
  });

  it("resetUsers clears all users and resets id counter", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "user1@example.com", password: "password123", name: "User 1" });
    await request(app)
      .post("/auth/register")
      .send({ email: "user2@example.com", password: "password123", name: "User 2" });

    resetUsers();

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "new@example.com", password: "password123", name: "New User" });
    expect(res.status).toBe(201);
    expect(res.body.user.id).toBe(1);
  });
});
