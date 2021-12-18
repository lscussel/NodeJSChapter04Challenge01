import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateUserError } from "@modules/users/useCases/createUser/CreateUserError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Leonardo Scussel",
      email: "leonardoscussel@teste.com.br",
      password: "123456"
    });

    expect(user).toHaveProperty("name");
  });

  it("Should not be able to create a new user with an email already used", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Leonardo Scussel",
        email: "leonardoscussel@teste.com.br",
        password: "123456"
      });

      await createUserUseCase.execute({
        name: "Teste",
        email: "leonardoscussel@teste.com.br",
        password: "654321"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

});
