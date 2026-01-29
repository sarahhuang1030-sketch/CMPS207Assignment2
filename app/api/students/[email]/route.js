import { NextResponse } from "next/server";
import { getPool, sql } from "../../../lib/database";

export async function DELETE(req, { params }) {
  try {
    const email = decodeURIComponent(params.email);
    const pool = await getPool();

    await pool
      .request()
      .input("email", sql.VarChar(255), email)
      .query(`DELETE FROM dbo.students WHERE email = @email`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/students/:email failed:", err);
    return new NextResponse("Delete failed", { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const email = decodeURIComponent(params.email);
    const incoming = await req.json();

    const pool = await getPool();

    // 1) Load existing row so we can merge (PATCH behavior)
    const existingRes = await pool
      .request()
      .input("email", sql.VarChar(255), email)
      .query(`SELECT TOP 1 * FROM dbo.students WHERE email = @email`);

    const existing = existingRes.recordset?.[0];
    if (!existing) {
      return new NextResponse("Student not found", { status: 404 });
    }

    // 2) Merge: only overwrite fields that were provided
    // (undefined = not provided)
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
      profile_picture_url:
        incoming.profile_picture_url !== undefined
          ? incoming.profile_picture_url
          : existing.profile_picture_url,
    };

    // 3) Update with merged data
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/students/:email failed:", err);

    // Friendly duplicate errors if you ever allow changing email later
    if (err?.number === 2627) {
      return new NextResponse("Duplicate value violates a unique constraint.", {
        status: 409,
      });
    }

    return new NextResponse(
      err?.message ? String(err.message) : "Update failed",
      { status: 500 }
    );
  }
}
