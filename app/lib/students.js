// app/lib/students.js

// Imports the shared SQL pool getter and the sql type helpers (sql.VarChar, etc.)
import { getPool, sql } from "./database.js"; // IMPORTANT: import sql too for parameter types

// Fetches all student rows from the database
export async function getAllUsers() {
    // Get (or reuse) the SQL connection pool
    const pool = await getPool();

    // Execute query and return the rows (recordset)
    const result = await pool.request().query("SELECT * FROM profile.dbo.students");
    return result.recordset;
}

// Fetches a single student row by email (used for a detail page)
export async function getStudentByEmail(email) {
    // Get (or reuse) the SQL connection pool
    const pool = await getPool();

    // Parameterized query prevents SQL injection and handles escaping safely
    const result = await pool
        .request()
        .input("email", sql.VarChar(255), email)
        .query("SELECT TOP 1 * FROM profile.dbo.students WHERE email = @email");

    // Return the first row or null if none found
    return result.recordset?.[0] ?? null;
}

// Creates a student record (optional)
// NOTE: If you're creating students via /api/students already, you may not need this function here.
export async function createUser(student) {
    // Destructure expected properties from the incoming student object
    const {
        first_name,
        last_name,
        email,
        phone,
        street_address,
        city,
        province_state,
        country,
        postal_code,
        program,
        year,

        // Optional field; default to null if not provided
        profile_picture_url = null,
    } = student;

    // Required field validation to prevent empty inserts
    const required = {
        first_name,
        last_name,
        email,
        phone,
        street_address,
        city,
        province_state,
        country,
        postal_code,
        program,
        year,
    };

    // Throw an error immediately if any required value is missing or blank
    for (const [k, v] of Object.entries(required)) {
        if (!v || String(v).trim() === "") {
            throw new Error(`Missing required field: ${k}`);
        }
    }

    // Get (or reuse) the SQL connection pool
    const pool = await getPool();

    // Check whether email already exists (enforces uniqueness at the app level)
    const existing = await pool
        .request()
        .input("email", sql.VarChar(255), email)
        .query("SELECT TOP 1 email FROM profile.dbo.students WHERE email = @email");

    // If a row is returned, block creation
    if (existing.recordset.length > 0) {
        throw new Error("Student with this email already exists");
    }

    // Insert new row using a parameterized query (prevents SQL injection)
    await pool
        .request()
        .input("first_name", sql.VarChar(100), first_name)
        .input("last_name", sql.VarChar(100), last_name)
        .input("email", sql.VarChar(255), email)
        .input("phone", sql.VarChar(50), phone)
        .input("street_address", sql.VarChar(255), street_address)
        .input("city", sql.VarChar(100), city)
        .input("province_state", sql.VarChar(100), province_state)
        .input("country", sql.VarChar(100), country)
        .input("postal_code", sql.VarChar(20), postal_code)
        .input("program", sql.VarChar(100), program)
        .input("year", sql.VarChar(10), year)
        .input("profile_picture_url", sql.VarChar(2048), profile_picture_url)
        .query(`
      INSERT INTO profile.dbo.students
      (first_name,last_name,email,phone,street_address,city,province_state,country,postal_code,program,year,profile_picture_url)
      VALUES
      (@first_name,@last_name,@email,@phone,@street_address,@city,@province_state,@country,@postal_code,@program,@year,@profile_picture_url)
    `);

    // Return a simple success object (useful for server actions / handlers)
    return { ok: true };
}
