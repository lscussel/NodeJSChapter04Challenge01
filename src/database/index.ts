//before implemeting supertests
//import { createConnection } from 'typeorm';
//(async () => await createConnection())();
import { Connection, createConnection, getConnectionOptions } from "typeorm";

export default async (host = "database_finapi"): Promise<Connection> => {
  const defaultOption = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOption, {
      host: process.env.NODE_ENV === "test" ? "localhost" : host,
      database: process.env.NODE_ENV === "test" ? "finapi_test" : defaultOption.database
    })
  );
}
