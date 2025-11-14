import sql from 'mssql';

// MSSQL connection config - uses env.local
const dbConfig = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | undefined;

export async function getConnection() {
  if (!pool) {
    pool = await new sql.ConnectionPool(dbConfig).connect();
  }
  return pool;
}

interface QueryParam {
  name: string;
  value: unknown;
}

export async function query(
  sqlQuery: string,
  params: QueryParam[] = []
): Promise<sql.IResult<any>> {
  const pool = await getConnection();
  const request = pool.request();
  params.forEach(({ name, value }) => {
    request.input(name, value);
  });
  return request.query(sqlQuery);
}
