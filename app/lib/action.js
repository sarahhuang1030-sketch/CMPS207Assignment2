// all quesries for the users table will be stored
//in this file
"use server";
//db will take the default export from database.js
//which is our database connection
//import db from "./database.js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUser } from "./students.js";

// export async function StudentAction(formData) {
//   // console.log(formData);

//   const firstName = formData.get("first_name");
//   const lastName = formData.get("last_name");
//   const email = formData.get("email");
//   const phone = formData.get("phone");
//   const street = formData.get("street_address");
//   const city = formData.get("city");
//   const province = formData.get("province_state");
//   const country = formData.get("country");
//   const postal = formData.get("poastal_code");
//   const program = formData.get("program");
//   const year = formData.get("year");

//   await createUser(formData);

//   //refreshes or updates the page by fetching from the database
//   revalidatePath("/form");
//   redirect("/");
// }
export async function StudentAction(formData) {
  const students = {
    first_name: formData.get("first_name"),
    // last_name: formData.get("last_name"),
    email: formData.get("email"),
    // phone: formData.get("phone"),
    // street_address: formData.get("street_address"),
    // city: formData.get("city"),
    // province_state: formData.get("province_state"),
    // country: formData.get("country"),
    // postal_code: formData.get("postal_code"), // typo here!
    // program: formData.get("program"),
    // year: formData.get("year"),
  };

  await createUser(students);

  revalidatePath("/form");
  redirect("/");
}

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

// server action functions
//this serves as intermediary between my form component and
//the database function to store data in the database

//formData is a JS object that contains the data
//submitted in the form
export async function UserAction(formData) {
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

  //refreshes or updates the page by fetching from the database
  revalidatePath("/form");
  redirect("/");
}
