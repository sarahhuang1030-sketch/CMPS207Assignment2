// // establish connection to the mysql db

// //import library for connection from installed package
// //database.js
// import { createPool } from "mysql2/promise";

// //console.log(process.env.DB_PASSWORD);

// //create connection
// const pool = createPool({
//   //uri: process.env.MYSQL_PUBLIC_URL,
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "Sarah923*",
//   database: process.env.DB_NAME || "oosd_webappdev",
//   port: process.env.DB_PORT || 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   connectTimeout: 60000,
//   dateStrings: true,
// });

// export default pool;

import sql from "mssql";

const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  port: Number(process.env.AZURE_SQL_PORT || 1433),
  options: {
    encrypt: true,              // required for Azure SQL
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

export function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

export { sql };
