import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "@modules/statements/entities/Statement";
import { CreateStatementUseCase } from "@modules/statements/useCases/createStatement/CreateStatementUseCase";
import { GetBalanceError } from "@modules/statements/useCases/getBalance/GetBalanceError";
import { GetBalanceUseCase } from "@modules/statements/useCases/getBalance/GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    await createUserUseCase.execute({
      name: "Leonardo Scussel",
      email: "leonardoscussel@teste.com.br",
      password: "123456"
    });

    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("Should be able to get balance from an existent user's account", async () => {
    const user = await authenticateUserUseCase.execute({
      email: "leonardoscussel@teste.com.br",
      password: "123456"
    });

    const user_id = user.user.id as string;
    const depositStatement = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1100.00,
      description: "2021 November Salary Payment"
    };
    await createStatementUseCase.execute(depositStatement);
    const withdrawStatement = {
      user_id,
      type: OperationType.WITHDRAW,
      amount: 50.00,
      description: "Pizza Time"
    };
    await createStatementUseCase.execute(withdrawStatement);

    const balance = await getBalanceUseCase.execute({ user_id });
    expect(balance).toHaveProperty("statement");
    expect(balance).toHaveProperty("balance");
  });

  it("Should not be able to get balance from an nonexistent user's account", async () => {
    expect(async () => {
      const user_id = "nonexistent";
      await getBalanceUseCase.execute({ user_id });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
