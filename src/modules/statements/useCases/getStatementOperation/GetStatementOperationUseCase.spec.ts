import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { OperationType, Statement } from "@modules/statements/entities/Statement";
import { CreateStatementUseCase } from "@modules/statements/useCases/createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "@modules/statements/useCases/getBalance/GetBalanceUseCase";
import { GetStatementOperationError } from "@modules/statements/useCases/getStatementOperation/GetStatementOperationError";
import { GetStatementOperationUseCase } from "@modules/statements/useCases/getStatementOperation/GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
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
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able to get statement operation by id", async () => {
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
    const balance = await getBalanceUseCase.execute({ user_id });
    const statement_id = balance.statement[0].id as string;
    const statementOperation = await getStatementOperationUseCase.execute({ user_id, statement_id});
    expect(statementOperation).toBeInstanceOf(Statement);
    expect(statementOperation).toHaveProperty("description");
  });

  it("Should not be able to get statement operation by a nonexistent id", async () => {
    expect(async () => {
      const user = await authenticateUserUseCase.execute({
        email: "leonardoscussel@teste.com.br",
        password: "123456"
      });

      const user_id = user.user.id as string;
      const statement_id = "nonexistent id";
      const statementOperation = await getStatementOperationUseCase.execute({ user_id, statement_id});
      expect(statementOperation).toBeInstanceOf(Statement);
      expect(statementOperation).toHaveProperty("description");
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("Should not be able to get statement operation from a non existent user", async () => {
    expect(async () => {
      const user_id = "nonexistente user";
      const statement_id = "nonexistent id";
      const statementOperation = await getStatementOperationUseCase.execute({ user_id, statement_id});
      expect(statementOperation).toBeInstanceOf(Statement);
      expect(statementOperation).toHaveProperty("description");
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
});
