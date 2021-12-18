import request from "supertest";
import  { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "@database/index";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users")
    .send({
      name: "Name Supertest",
      email: "supertest@teste.com.br",
      password: "123456"
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a new user with an email already used", async () => {
    const response = await request(app).post("/api/v1/users")
    .send({
      name: "Another Supertest",
      email: "supertest@teste.com.br",
      password: "888888"
    });

    const { message } = response.body;
    expect(response.status).toBe(400);
    expect(message).toBe("User already exists");
  });
});
