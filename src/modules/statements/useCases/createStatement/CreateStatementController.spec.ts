import request from "supertest";
import  { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "@database/index";

import { v4 as uuid } from "uuid";
import authConfig from "@config/auth";
import { sign } from "jsonwebtoken";

let connection: Connection;

describe("Create Statement Controller", () => {
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

  it("Should be possible to make a deposit to the authenticated user's account", async () => {
    const response = await request(app).post("/api/v1/sessions")
    .send({
      email: "supertest@teste.com.br",
      password: "123456"
    });
    const { token } = response.body;

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "2021 November Salary Payment"
    })
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(responseDeposit.status).toBe(201);
  });

  it("Should be possible to make a withdraw from an authenticated user's account with balance", async () => {
    const response = await request(app).post("/api/v1/sessions")
    .send({
      email: "supertest@teste.com.br",
      password: "123456"
    });
    const { token } = response.body;

    const responseWithdraw = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 50,
      description: "Pizza time!"
    })
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(responseWithdraw.status).toBe(201);
  });

  it("Should not be possible to make a withdraw from an authenticated user's account without balance", async () => {
    const response = await request(app).post("/api/v1/sessions")
    .send({
      email: "supertest@teste.com.br",
      password: "123456"
    });

    const { token } = response.body;
    const responseWithdraw = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 100,
      description: "Emergencies!"
    })
    .set({
      Authorization: `Bearer ${token}`
    });

    const { message } = responseWithdraw.body;

    expect(responseWithdraw.status).toBe(400);
    expect(message).toBe("Insufficient funds");
  });

  it("Should not be possible to make any operacion from a nonexistent user", async () => {
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

    const response = await request(app).get("/api/v1/statements/withdraw")
    .send({
      amount: 1,
      description: "fraud!"
    })
    .set({
      Authorization: `Bearer ${token}`
    });
    const { message } = response.body;

    expect(response.status).toBe(404);
    expect(message).toBe("User not found");
  });
});
