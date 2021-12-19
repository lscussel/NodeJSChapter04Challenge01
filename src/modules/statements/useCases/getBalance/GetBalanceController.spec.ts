import request from "supertest";
import  { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "@database/index";

import { v4 as uuid } from "uuid";
import authConfig from "@config/auth";
import { sign } from "jsonwebtoken";

let connection: Connection;

describe("Get Balance Controller", () => {
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

  it("Should be able to get balance from an existent user's account", async () => {
    const response = await request(app).post("/api/v1/sessions")
    .send({
      email: "supertest@teste.com.br",
      password: "123456"
    });

    const { token } = response.body;
    await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "2021 November Salary Payment"
    })
    .set({
      Authorization: `Bearer ${token}`
    });
    await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 50,
      description: "Pizza time!"
    })
    .set({
      Authorization: `Bearer ${token}`
    });

    const responseBalance = await request(app).get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`
    });
    const { balance } = responseBalance.body;

    expect(responseBalance.status).toBe(200);
    expect(balance).toBeDefined();
  });

  it("Should not be able to get balance from an nonexistent user's account", async () => {
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

    const responseBalance = await request(app).get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`
    });
    const { message } = responseBalance.body;

    expect(responseBalance.status).toBe(404);
    expect(message).toBe("User not found");
  });
});
