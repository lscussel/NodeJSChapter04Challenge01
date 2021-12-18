import request from "supertest";
import  { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "@database/index";

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
  });

  it("Should be possible to make a withdraw from an authenticated user's account with balance", async () => {

  });

  it("Should not be possible to make a withdraw from an authenticated user's account without balance", async () => {

  });

  it("Should not be possible to make any operacion from a nonexistent user", async () => {

  });
});