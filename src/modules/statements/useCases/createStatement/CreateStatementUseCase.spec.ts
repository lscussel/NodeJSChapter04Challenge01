import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "@modules/statements/entities/Statement";
import { CreateStatementUseCase } from "@modules/statements/useCases/createStatement/CreateStatementUseCase";
import { Statement } from "@modules/statements/entities/Statement";
import { CreateStatementError } from "@modules/statements/useCases/createStatement/CreateStatementError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {

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
  });

  it("Should be possible to make a deposit to the authenticated user's account", async () => {
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
    const result = await createStatementUseCase.execute(depositStatement);
    expect(result).toBeInstanceOf(Statement)
    expect(result.type).toEqual("deposit");
  });

  it("Should be possible to make a withdraw from an authenticated user's account with balance", async () => {
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
    const result = await createStatementUseCase.execute(withdrawStatement);
    expect(result).toBeInstanceOf(Statement)
    expect(result.type).toEqual("withdraw");
  });

  it("Should not be possible to make a withdraw from an authenticated user's account without balance", async () => {
    expect(async () => {
      const user = await authenticateUserUseCase.execute({
        email: "leonardoscussel@teste.com.br",
        password: "123456"
      });

      const user_id = user.user.id as string;
      const withdrawStatement = {
        user_id,
        type: OperationType.WITHDRAW,
        amount: 50.00,
        description: "Pizza Time"
      };
      await createStatementUseCase.execute(withdrawStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("Should not be possible to make any operacion from a nonexistent user", async () => {
    expect(async () => {
      const user_id = "nonexistent";
      const withdrawStatement = {
        user_id,
        type: OperationType.WITHDRAW,
        amount: 50.00,
        description: "Pizza Time"
      };
      await createStatementUseCase.execute(withdrawStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
