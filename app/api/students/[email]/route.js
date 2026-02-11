import { NextResponse } from "next/server";
import { getPool, sql } from "../../../lib/database";

// Deletes a student row by email (email comes from the route param)
export async function DELETE(req, { params }) {
    try {
        // Decode the email because route params may include URL-encoded characters
        const email = decodeURIComponent(params.email);

        // Get (or create) the SQL connection pool
        const pool = await getPool();

        // Parameterized query prevents SQL injection and handles escaping safely
        await pool
            .request()
            .input("email", sql.VarChar(255), email)
            .query(`DELETE FROM dbo.students WHERE email = @email`);

        // Return a simple success response
        return NextResponse.json({ ok: true });
    } catch (err) {
        // Log server-side for debugging
        console.error("DELETE /api/students/:email failed:", err);

        // Send generic error to client (avoid leaking internal details)
        return new NextResponse("Delete failed", { status: 500 });
    }
}

// Updates a student row by email, using "merge" logic (PATCH-like behavior)
export async function PUT(req, { params }) {
    try {
        // Decode the email because route params may include URL-encoded characters
        const email = decodeURIComponent(params.email);

        // Incoming JSON may contain only the fields being updated
        const incoming = await req.json();

        // Get (or create) the SQL connection pool
        const pool = await getPool();

        // 1) Load the existing row so we can merge values (PATCH behavior)
        const existingRes = await pool
            .request()
            .input("email", sql.VarChar(255), email)
            .query(`SELECT TOP 1 * FROM dbo.students WHERE email = @email`);

        // Pull the first row from the recordset
        const existing = existingRes.recordset?.[0];

        // If no row exists, return 404
        if (!existing) {
            return new NextResponse("Student not found", { status: 404 });
        }

        // 2) Merge: overwrite only fields that were provided by the client
        // - `??` means: use incoming value unless it is null/undefined
        // - special case: profile_picture_url uses `!== undefined` so null can clear it
        const merged = {
            first_name: incoming.first_name ?? existing.first_name,
            last_name: incoming.last_name ?? existing.last_name,
            phone: incoming.phone ?? existing.phone,
            street_address: incoming.street_address ?? existing.street_address,
            city: incoming.city ?? existing.city,
            province_state: incoming.province_state ?? existing.province_state,
            country: incoming.country ?? existing.country,
            postal_code: incoming.postal_code ?? existing.postal_code,
            program: incoming.program ?? existing.program,
            year: incoming.year ?? existing.year,

            // If client sends:
            // - undefined => keep existing
            // - null      => clear the value in DB
            // - string    => replace with new URL
            profile_picture_url:
                incoming.profile_picture_url !== undefined
                    ? incoming.profile_picture_url
                    : existing.profile_picture_url,
        };

        // 3) Update the row with merged data (still parameterized)
        await pool
            .request()
            .input("email", sql.VarChar(255), email)
            .input("first_name", sql.VarChar(100), merged.first_name)
            .input("last_name", sql.VarChar(100), merged.last_name)
            .input("phone", sql.VarChar(50), merged.phone)
            .input("street_address", sql.VarChar(255), merged.street_address)
            .input("city", sql.VarChar(100), merged.city)
            .input("province_state", sql.VarChar(100), merged.province_state)
            .input("country", sql.VarChar(100), merged.country)
            .input("postal_code", sql.VarChar(20), merged.postal_code)
            .input("program", sql.VarChar(100), merged.program)
            .input("year", sql.VarChar(10), merged.year)

            // Store null if merged value is null/undefined (so DB column can be cleared)
            .input(
                "profile_picture_url",
                sql.VarChar(2048),
                merged.profile_picture_url ?? null
            )
            .query(`
        UPDATE dbo.students
        SET first_name=@first_name,
            last_name=@last_name,
            phone=@phone,
            street_address=@street_address,
            city=@city,
            province_state=@province_state,
            country=@country,
            postal_code=@postal_code,
            program=@program,
            year=@year,
            profile_picture_url=@profile_picture_url
        WHERE email=@email
      `);

        // Return a simple success response
        return NextResponse.json({ ok: true });
    } catch (err) {
        // Log server-side for debugging
        console.error("PUT /api/students/:email failed:", err);

        // SQL Server unique constraint violation (if you ever update unique fields later)
        if (err?.number === 2627) {
            return new NextResponse("Duplicate value violates a unique constraint.", {
                status: 409,
            });
        }

        // Return error message if available, otherwise a generic failure message
        return new NextResponse(
            err?.message ? String(err.message) : "Update failed",
            { status: 500 }
        );
    }
}
