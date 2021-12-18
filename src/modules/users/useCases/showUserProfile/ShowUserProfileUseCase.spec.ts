import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { ShowUserProfileError } from "@modules/users/useCases/showUserProfile/ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    await createUserUseCase.execute({
      name: "Leonardo Scussel",
      email: "leonardoscussel@teste.com.br",
      password: "123456"
    });

    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("Should be possible to show an existent user's profile", async () => {
    const user = await authenticateUserUseCase.execute({
      email: "leonardoscussel@teste.com.br",
      password: "123456"
    });

    const user_id = user.user.id as string;
    const result = await showUserProfileUseCase.execute(user_id);
    expect(result).toHaveProperty("password");
  });

  it("Should not be possible to show an nonexistent user's profile", async () => {
    expect(async () => {
      const user_id = "nonexistent";
      const result = await showUserProfileUseCase.execute(user_id);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

});
