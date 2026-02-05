import { NextResponse } from "next/server";
import { getPool, sql } from "../../lib/database";

// Creates a new student row from multipart/form-data
export async function POST(req) {
    try {
        // Parse multipart form data (typical when submitting <form> or file uploads)
        const form = await req.formData();

        // Read values using the EXACT input "name" attributes from the HTML form
        const first_name = form.get("first_name");
        const last_name = form.get("last_name");
        const phone = form.get("phone");
        const email = form.get("email");
        const street_address = form.get("street_address"); // must match the form input name
        const city = form.get("city");
        const province_state = form.get("province_state");
        const country = form.get("country");
        const postal_code = form.get("postal_code");
        const program = form.get("program");
        const year = form.get("year");

        // Optional field: store null when not provided
        const profile_picture_url = form.get("profile_picture_url") || null;

        // Basic server-side validation to prevent empty/NULL inserts for required fields
        const required = {
            first_name,
            last_name,
            phone,
            email,
            street_address,
            city,
            province_state,
            country,
            postal_code,
            program,
            year,
        };

        // If any required field is missing or blank, fail fast with a 400 response
        for (const [k, v] of Object.entries(required)) {
            if (!v || String(v).trim() === "") {
                return new NextResponse(`Missing required field: ${k}`, { status: 400 });
            }
        }

        // Get (or create) the SQL connection pool
        const pool = await getPool();

        // Insert a new student row using a parameterized query (prevents SQL injection)
        await pool
            .request()
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

        // Return success JSON
        return NextResponse.json({ ok: true });
    } catch (err) {
        // Log server-side for debugging
        console.error("POST /api/students failed:", err);

        // Return error message if available, otherwise a generic server error
        return new NextResponse(err?.message ? String(err.message) : "Server error", {
            status: 500,
        });
    }
}
