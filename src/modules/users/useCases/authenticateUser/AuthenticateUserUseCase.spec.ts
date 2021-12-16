import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";

import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository;
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);

  });

  it("Should be able to authenticate a user", async () => {
    await createUserUseCase.execute({
      name: "Leonardo Scussel",
      email: "leonardoscussel@teste.com.br",
      password: "123456"
    });

    const user = await authenticateUserUseCase.execute({
      email: "leonardoscussel@teste.com.br",
      password: "123456"
    });

    expect(user).toHaveProperty("user");
  });

  it("Should not be able to authenticate with a non existent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "leonardoscussel@teste.com.br",
        password: "123456"
      });

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate with an incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Leonardo Scussel",
        email: "leonardoscussel@teste.com.br",
        password: "123456"
      });

      await authenticateUserUseCase.execute({
        email: "leonardoscussel@teste.com.br",
        password: "888888"
      });

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });



});
