import request from "supertest";
import  { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "@database/index";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users")
    .send({
      name: "Name Supertest",
      email: "supertest@teste.com.br",
      password: "123456"
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an existent user", async () => {
    const response = await request(app).post("/api/v1/sessions")
    .send({
      email: "supertest@teste.com.br",
      password: "123456"
    });
    const responseTextObj = JSON.parse(response.text);

    expect(response.status).toBe(200);
    expect(responseTextObj).toHaveProperty("token");
  });

  it("Should not be able to authenticate a nonexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions")
    .send({
      email: "anotheruser@teste.com.br",
      password: "123456"
    });
    const { message } = response.body;

    expect(response.status).toBe(401);
    expect(message).toBe("Incorrect email or password");
  });

  it("Should not be able to authenticate an existente user with a wrong password", async () => {
    const response = await request(app).post("/api/v1/sessions")
    .send({
      email: "supertest@teste.com.br",
      password: "888888"
    });
    const { message } = response.body;

    expect(response.status).toBe(401);
    expect(message).toBe("Incorrect email or password");
  });
});
