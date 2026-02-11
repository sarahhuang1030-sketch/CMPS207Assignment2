// All queries / server actions related to the users (students) table live in this file

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUser } from "./students.js";

// Old version kept for reference (pulled values individually, then passed full formData)
// export async function StudentAction(formData) {
//   const firstName = formData.get("first_name");
//   const lastName = formData.get("last_name");
//   const email = formData.get("email");
//   const phone = formData.get("phone");
//   const street = formData.get("street_address");
//   const city = formData.get("city");
//   const province = formData.get("province_state");
//   const country = formData.get("country");
//   const postal = formData.get("poastal_code"); // typo in key: "poastal_code"
//   const program = formData.get("program");
//   const year = formData.get("year");
//
//   await createUser(formData);
//
//   revalidatePath("/form");
//   redirect("/");
// }

// Server Action: currently creates a user but only sends a subset of fields
export async function StudentAction(formData) {
    // Build an object from the submitted FormData
    // NOTE: Most fields are commented out, so only first_name + email are being saved
    const students = {
        first_name: formData.get("first_name"),

        // last_name: formData.get("last_name"),
        email: formData.get("email"),

        // phone: formData.get("phone"),
        // street_address: formData.get("street_address"),
        // city: formData.get("city"),
        // province_state: formData.get("province_state"),
        // country: formData.get("country"),
        // postal_code: formData.get("postal_code"),
        // program: formData.get("program"),
        // year: formData.get("year"),
    };

    // Calls the DB-layer function to insert the user
    await createUser(students);

    // Forces the /form page to re-fetch data if it was cached
    revalidatePath("/form");

    // Redirect back to home after creating the user
    redirect("/");
}

// Notes / scratch section kept for reference (not executed)
//  const firstName = formData.get("first_name"),
//  const lastName = formData.get("last_name"),
//  const email = formData.get("email"),
//     phone: formData.get("phone"),
//     street: formData.get("street_address"),
//     city: formData.get("city"),
//     province: formData.get("province_state"),
//     country: formData.get("country"),
//     postal: formData.get("poastal_code"),
//     program: formData.get("program"),
//     year: formData.get("year"),

// Server Action: creates a user using all expected form fields
// Acts as an intermediary between the form UI component and the database insert function
export async function UserAction(formData) {
    // Extract values from FormData using the form input "name" attributes
    const first_name = formData.get("first_name");
    const last_name = formData.get("last_name");
    const email = formData.get("email");
    const street_address = formData.get("street_address");
    const city = formData.get("city");
    const province_state = formData.get("province_state");
    const country = formData.get("country");
    const postal_code = formData.get("postal_code");
    const program = formData.get("program");
    const year = formData.get("year");

    // Insert the new user into the database
    await createUser({
        first_name,
        last_name,
        email,
        street_address,
        city,
        province_state,
        country,
        postal_code,
        program,
        year,
    });

    // Refresh the /form path if cached and return to home
    revalidatePath("/form");
    redirect("/");
}
