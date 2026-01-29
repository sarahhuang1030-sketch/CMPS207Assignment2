// app/lib/students.js
import { getPool, sql } from "./database.js"; // <-- IMPORTANT: import sql too

// Get all students
export async function getAllUsers() {
  const pool = await getPool();
  const result = await pool.request().query("SELECT * FROM profile.dbo.students");
  return result.recordset;
}

// Get 1 student by email (for detail page)
export async function getStudentByEmail(email) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("email", sql.VarChar(255), email)
    .query("SELECT TOP 1 * FROM profile.dbo.students WHERE email = @email");

  return result.recordset?.[0] ?? null;
}

// Create student (optional — only if you still want it here)
// NOTE: you already create students via /api/students, so you may not need this.
export async function createUser(student) {
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
    profile_picture_url = null,
  } = student;

  // Basic required field checks
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

  for (const [k, v] of Object.entries(required)) {
    if (!v || String(v).trim() === "") {
      throw new Error(`Missing required field: ${k}`);
    }
  }

  const pool = await getPool();

  // Check unique email
  const existing = await pool
    .request()
    .input("email", sql.VarChar(255), email)
    .query("SELECT TOP 1 email FROM profile.dbo.students WHERE email = @email");

  if (existing.recordset.length > 0) {
    throw new Error("Student with this email already exists");
  }

  // Insert
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

  return { ok: true };
}
