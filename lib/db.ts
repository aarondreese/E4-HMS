import sql from 'mssql';

const config = {
  user: process.env.DB_USER ?? '',
  password: process.env.DB_PASSWORD ?? '',
  server: process.env.DB_SERVER ?? '', // e.g. 'localhost'
  database: process.env.DB_NAME ?? '',
  options: {
    encrypt: false, // For local dev, set to true for Azure
    trustServerCertificate: true, // For local dev
  },
};

let pool: sql.ConnectionPool | undefined;

export async function getConnection() {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
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
