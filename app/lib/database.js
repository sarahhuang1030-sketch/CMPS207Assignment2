// Legacy MySQL connection setup (kept commented out for reference)
// This was used before switching to Azure SQL Server

// import { createPool } from "mysql2/promise";

// const pool = createPool({
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

// ------------------------------------------------------------
// Legacy Azure SQL configuration (inline, replaced by safer version below)
// ------------------------------------------------------------

// import sql from "mssql";

// const config = {
//   server: process.env.AZURE_SQL_SERVER,
//   database: process.env.AZURE_SQL_DATABASE,
//   user: process.env.AZURE_SQL_USER,
//   password: process.env.AZURE_SQL_PASSWORD,
//   port: Number(process.env.AZURE_SQL_PORT || 1433),
//   options: {
//     encrypt: true,
//     trustServerCertificate: false,
//   },
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000,
//   },
// };

// let poolPromise;

// export function getPool() {
//   if (!poolPromise) {
//     poolPromise = sql.connect(config);
//   }
//   return poolPromise;
// }

// export { sql };

// ------------------------------------------------------------
// Current Azure SQL Server connection (environment-validated)
// ------------------------------------------------------------

import sql from "mssql";

// Helper to enforce required environment variables at startup
function req(name) {
    const v = process.env[name];

    // Fail fast with a clear message if a required variable is missing
    if (!v) {
        throw new Error(
            `${name} is missing (check GitHub Secrets / Azure App Settings)`
        );
    }
    return v;
}

// Cached connection promise (singleton) to avoid opening multiple pools
let poolPromise;

// Returns a shared SQL connection pool
export function getPool() {
    // Create the pool only once per server runtime
    if (!poolPromise) {
        const config = {
            server: req("AZURE_SQL_SERVER"),
            database: req("AZURE_SQL_DATABASE"),
            user: req("AZURE_SQL_USER"),
            password: req("AZURE_SQL_PASSWORD"),

            // Azure SQL default port
            port: Number(process.env.AZURE_SQL_PORT || 1433),

            // Azure SQL requires encryption
            options: {
                encrypt: true,
                trustServerCertificate: false,
            },

            // Connection pool tuning
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000,
            },
        };

        // Initialize and cache the pool promise
        poolPromise = sql.connect(config);
    }

    return poolPromise;
}

// Export sql so callers can access types (sql.VarChar, etc.)
export { sql };
