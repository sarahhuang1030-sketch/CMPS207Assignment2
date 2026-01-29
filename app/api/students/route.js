import { NextResponse } from "next/server";
import { getPool, sql } from "../../lib/database";

export async function POST(req) {
  try {
    const form = await req.formData();

    // Read EXACT names from <input name="...">
    const first_name = form.get("first_name");
    const last_name = form.get("last_name");
    const phone = form.get("phone");
    const email = form.get("email");
    const street_address = form.get("street_address"); // <-- must match
    const city = form.get("city");
    const province_state = form.get("province_state");
    const country = form.get("country");
    const postal_code = form.get("postal_code");
    const program = form.get("program");
    const year = form.get("year");
    const profile_picture_url = form.get("profile_picture_url") || null;

    // Simple server-side guard (prevents NULL inserts)
    const required = {
      first_name, last_name, phone, email,
      street_address, city, province_state,
      country, postal_code, program, year,
    };
    for (const [k, v] of Object.entries(required)) {
      if (!v || String(v).trim() === "") {
        return new NextResponse(`Missing required field: ${k}`, { status: 400 });
      }
    }

    const pool = await getPool();

    await pool.request()
      .input("first_name", sql.VarChar(100), first_name)
      .input("last_name", sql.VarChar(100), last_name)
      .input("phone", sql.VarChar(50), phone)
      .input("email", sql.VarChar(255), email)
      .input("street_address", sql.VarChar(255), street_address)
      .input("city", sql.VarChar(100), city)
      .input("province_state", sql.VarChar(100), province_state)
      .input("country", sql.VarChar(100), country)
      .input("postal_code", sql.VarChar(20), postal_code)
      .input("program", sql.VarChar(100), program)
      .input("year", sql.VarChar(10), year)
      .input("profile_picture_url", sql.VarChar(2048), profile_picture_url)
      .query(`
        INSERT INTO dbo.students
        (first_name, last_name, phone, email, street_address, city, province_state, country, postal_code, program, year, profile_picture_url)
        VALUES
        (@first_name, @last_name, @phone, @email, @street_address, @city, @province_state, @country, @postal_code, @program, @year, @profile_picture_url)
      `);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/students failed:", err);
    return new NextResponse(err?.message ? String(err.message) : "Server error", { status: 500 });
  }
}
