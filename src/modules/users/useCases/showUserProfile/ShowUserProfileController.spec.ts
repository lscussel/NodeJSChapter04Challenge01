import request from "supertest";
import  { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "@database/index";

import { v4 as uuid } from "uuid";
import authConfig from "@config/auth";
import { sign } from "jsonwebtoken";

let connection: Connection;

describe("Show User Profile Controller", () => {
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

  it("Should be possible to show an existent user's profile", async () => {
    const response = await request(app).post("/api/v1/sessions")
    .send({
      email: "supertest@teste.com.br",
      password: "123456"
    });
    const { token } = response.body;

    const userProfile = await request(app).get("/api/v1/profile")
    .set({
      Authorization: `Bearer ${token}`
    });
    const { name } = userProfile.body;

    expect(userProfile.status).toBe(200);
    expect(name).toBe("Name Supertest");
  });

  it("Should not be possible to show an nonexistent user's profile", async () => {
    const id = uuid();
    const user = {
      id,
      name: "intruder",
      email: "intruder@teste.com.br"
    };
    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({ user }, secret, {
      subject: user.id,
      expiresIn,
    });

    const response = await request(app).get("/api/v1/profile")
    .set({
      Authorization: `Bearer ${token}`
    });
    const { message } = response.body;

    expect(response.status).toBe(404);
    expect(message).toBe("User not found");
  });
});
