"use client";
//"use server";
//import { useState, useEffect } from "react";
import { useEffect, useState } from "react";
import { StudentAction } from "../lib/action.js";
//import { getAllStudents } from "../lib/students.js";
//import { createStudents } from "../lib/students";
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
//import { getList } from "../../lib/action.js";

export default function ValidationForm() {
  //const students = await getAllStudents();
  //const isEditing = !!students;
  // const [value, setValue] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  //const [password, setPassword] = useState("");
  const [postalcode, setPostalcode] = useState("");
  const [program, setProgram] = useState("");
  const [year, setYear] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [errors, setErrors] = useState({});

  const patterns = {
    //allows letters (uppercase and lowercase), accents, and hyphens, and requires at least two characters.
    firstName: /^[a-zA-Z\u00C0-\u00FF'-]{2,}$/,
    lastName: /^[a-zA-Z\u00C0-\u00FF'-]{2,}$/,
    phone: /^[\d\s\-\(\)]{10}$/,
    //  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    // cc: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/,

    //\d{4}          # Exactly 4 digits
    //[\s\-]?        # Optional space or hyphen
    year: /^y[1-4]$/,
    postalcode: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  };

  const validate = (field, value) => {
    try {
      if (!value) {
        setErrors((prev) => ({ ...prev, [field]: `${field} is required.` }));
        // added patterns[field] && because program is not an input value
      } else if (patterns[field] && !patterns[field].test(value)) {
        const messages = {
          firstName: "Please enter your first name.",
          lastName: "Please enter your last name.",
          program: "Please select your program.",
          year: "Please enter your year (e.g. Y1)",
          phone: "Phone number must be at least 10 digits.",
          street: "Please enter your address",
          city: "Please select your city",
          province: "please select your province",
          //  password:
          //    "Password must be 8+ characters, include uppercase, lowercase, and a number.",
          //    cc: "Credit card number must be 16 digits",
          postalcode:
            "Postal code must follow Canadian format (e.g., T2N 1N4).",
        };
        setErrors((prev) => ({ ...prev, [field]: messages[field] }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    } catch (err) {
      console.error(`Validation error for ${field}:`, err);
      setErrors((prev) => ({
        ...prev,
        [field]: `Error validating ${field}`,
      }));
    }
  };

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [city]);
  // validate("email", email);
  // validate("phone", phone);
  // validate("password", password);
  // validate("cc", cc);
  // validate("postalcode", postalcode);
  const handleSubmit = (e) => {
    e.preventDefault();

    if (city.trim()) {
      setCity(city.trim());
    }

    try {
      const fields = {
        firstName,
        lastName,
        phone,
        street,
        city,
        province,
        program,
        year,
        postalcode,
      };
      let hasError = false;

      for (const field in fields) {
        validate(field, fields[field]);
        if (patterns[field] && !patterns[field].test(fields[field])) {
          hasError = true;
        }
      }

      if (hasError) {
        alert("Please fix the errors before submitting.");
        return;
      }

      alert("Form submitted successfully!");
      // Optionally reset form here
    } catch (err) {
      console.error("Submission error:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 m-3 max-w-md mx-auto">
      {/* <form onSubmit={handleSubmit}> */}
      <form action={StudentAction}>
        <div>
          <label>First Name:</label>
          <input
            name="first_name"
            className="border rounded mb-3"
            value={first_name}
            onChange={(e) => {
              setFirstname(e.target.value);
              validate("first_name", e.target.value);
            }}
            onBlur={() => validate("first_name", first_name)}
          />
          {errors.first_name && (
            <span className="error">{errors.first_name}</span>
          )}
        </div>
        <div>
          <label>Last Name:</label>
          <input
            name="last_name"
            className="border rounded mb-3"
            value={last_name}
            onChange={(e) => {
              setLastname(e.target.value);
              validate("last_name", e.target.value);
            }}
            onBlur={() => validate("last_name", last_name)}
          />
          {errors.last_name && (
            <span className="error">{errors.last_name}</span>
          )}
        </div>

        <div>
          <label>Program:</label>

          <input
            name="program"
            className="border rounded mb-3"
            value={program}
            onChange={(e) => {
              setProgram(e.target.value);
              validate("program", e.target.value);
            }}
            onBlur={() => validate("program", program)}
          />

          {errors.program && <span className="error">{errors.program}</span>}
        </div>
        <div>
          <label>Year:</label>

          <input
            name="year"
            className="border rounded mb-3"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              validate("year", e.target.value);
            }}
            onBlur={() => validate("year", year)}
          />

          {errors.year && <span className="error">{errors.year}</span>}
        </div>
        <div>
          <label>Phone:</label>
          <input
            name="phone"
            className="border rounded mb-3"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              validate("phone", e.target.value);
            }}
            onBlur={() => validate("phone", phone)}
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        <div>
          <label>Street Address:</label>

          <input
            name="street_address"
            className="border rounded mb-3"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              validate("street", e.target.value);
            }}
            onBlur={() => validate("street", street)}
          />
          {errors.street && <span className="error">{errors.street}</span>}
        </div>

        <div>
          <label>Province:</label>

          <input
            name="province_state"
            className="border rounded mb-3"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              validate("province", e.target.value);
            }}
            onBlur={() => validate("province", province)}
          />

          {errors.province && <span className="error">{errors.province}</span>}
        </div>
        <div>
          <label>City:</label>

          <input
            name="city"
            className="border rounded mb-3"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              validate("city", e.target.value);
            }}
            onBlur={() => validate("city", city)}
          />
          {errors.city && <span className="error">{errors.city}</span>}
        </div>
        <div>
          <label>Postal Code:</label>
          <input
            name="postal_code"
            className="border rounded mb-3"
            value={postalcode}
            onChange={(e) => {
              setPostalcode(e.target.value);
              validate("postalcode", e.target.value);
            }}
            onBlur={() => validate("postalcode", postalcode)}
          />
          {errors.postalcode && (
            <span className="error">{errors.postalcode}</span>
          )}
        </div>

        <button type="submit" className="bg-blue-600 p-2 rounded text-white">
          {isEditing ? "Update Student" : "Add Student"}
        </button>
      </form>
      {/* <StudentList /> */}
      {loading && <p>Loading weather…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {data && (
        <div className="mt-4">
          <p className="font-semibold">{data.name}</p>
          <p>
            {Math.round(data.main.temp)}°C — {data.weather[0].description}
          </p>
        </div>
      )}
    </div>
  );
}
