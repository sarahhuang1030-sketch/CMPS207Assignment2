"use client";
import { useRouter } from "next/navigation";
import { UserAction } from "../lib/action"; // kept (even if unused) to avoid breaking imports
import { useState, useEffect } from "react";

export default function UsersPage({ students }) {
  //  const students = await getAllUsers();
  const router = useRouter();

  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [street_address, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [province_state, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [postal_code, setPostal] = useState("");
  const [program, setProgram] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setProfilePic(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePicPreview(url);
    } else {
      setProfilePicPreview(null);
    }
  };

  const patterns = {
    //allows letters (uppercase and lowercase), accents, and hyphens, and requires at least two characters.
    first_name: /^[a-zA-Z\u00C0-\u00FF'-]{2,}$/,
    last_name: /^[a-zA-Z\u00C0-\u00FF'-]{2,}$/,
    phone: /^[\d\s\-\(\)]{10}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    year: /^y[1-4]$/i,
    postalcode: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  };

  const validate = (field, value) => {
    try {
      if (!value) {
        setErrors((prev) => ({ ...prev, [field]: `${field} is required.` }));
      } else if (patterns[field] && !patterns[field].test(value)) {
        const messages = {
          first_name: "Please enter your first name.",
          last_name: "Please enter your last name.",
          email: "Please enter your email (e.g. example@example.com)",
          program: "Please enter your program.",
          year: "Please enter your year (e.g. Y1)",
          phone: "Phone number must be at least 10 digits.",
          street_address: "Please enter your address",
          country: "Please enter your country",
          city: "Please enter your city",
          province_state: "please select your province",
          postal_code:
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

  async function uploadToAzureBlob(file) {
    const sasRes = await fetch("/api/blob-sas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      }),
    });

    if (!sasRes.ok) {
      throw new Error("Failed to get SAS URL");
    }

    const { uploadUrl, publicUrl } = await sasRes.json();

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error("Blob upload failed");
    }

    return publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploadError(null);

    try {
      setUploading(true);

      const formData = new FormData(e.currentTarget);

      if (profilePic) {
        const url = await uploadToAzureBlob(profilePic);
        setProfilePicUrl(url);
        formData.set("profile_picture_url", url);
      }

      console.log("submitting...");

      const res = await fetch("/api/students", {
        method: "POST",
        body: formData,
      });

      console.log("Student API status:", res.status);

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Saving student failed");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setUploadError(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  const labelClass = "block text-sm font-medium text-slate-700";
  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";
  const errorClass = "mt-2 text-sm text-red-600";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Students</h1>
          <p className="mt-1 text-slate-600">
            Create a new student record and optionally upload a profile picture.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Add Student</h2>
            <p className="mt-1 text-sm text-slate-500">
              Fields marked with * are required.
            </p>
          </div>

          <div className="px-6 py-6">
            {uploadError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {uploadError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  name="first_name"
                  onChange={(e) => {
                    setFirstname(e.target.value);
                    validate("first_name", e.target.value);
                  }}
                  onBlur={() => validate("first_name", first_name)}
                  type="text"
                  required
                  className={inputClass}
                />
                {errors.first_name && <p className={errorClass}>{errors.first_name}</p>}
              </div>

              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  onChange={(e) => {
                    setLastname(e.target.value);
                    validate("last_name", e.target.value);
                  }}
                  onBlur={() => validate("last_name", last_name)}
                  name="last_name"
                  type="text"
                  required
                  className={inputClass}
                />
                {errors.last_name && <p className={errorClass}>{errors.last_name}</p>}
              </div>

              <div>
                <label className={labelClass}>Phone *</label>
                <input
                  onChange={(e) => {
                    setPhone(e.target.value);
                    validate("phone", e.target.value);
                  }}
                  onBlur={() => validate("phone", phone)}
                  name="phone"
                  type="text"
                  required
                  className={inputClass}
                />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>

              <div>
                <label className={labelClass}>Email *</label>
                <input
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validate("email", e.target.value);
                  }}
                  onBlur={() => validate("email", email)}
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
              </div>

              <div>
                <label className={labelClass}>Street *</label>
                <input
                  onChange={(e) => {
                    setStreet(e.target.value);
                    validate("street_address", e.target.value);
                  }}
                  onBlur={() => validate("street_address", street_address)}
                  name="street_address"
                  type="text"
                  required
                  className={inputClass}
                />
                {errors.street_address && (
                  <p className={errorClass}>{errors.street_address}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>City *</label>
                <input
                  onChange={(e) => {
                    setCity(e.target.value);
                    validate("city", e.target.value);
                  }}
                  onBlur={() => validate("city", city)}
                  value={city}
                  name="city"
                  type="text"
                  required
                  className={inputClass}
                />
                {errors.city && <p className={errorClass}>{errors.city}</p>}
              </div>

              <div>
                <label className={labelClass}>Province *</label>
                <input
                  onChange={(e) => {
                    setProvince(e.target.value);
                    validate("province_state", e.target.value);
                  }}
                  onBlur={() => validate("province_state", province_state)}
                  name="province_state"
                  type="text"
                  required
                  className={inputClass}
                />
                {errors.province_state && (
                  <p className={errorClass}>{errors.province_state}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Country *</label>
                <input
                  onChange={(e) => {
                    setCountry(e.target.value);
                    validate("country", e.target.value);
                  }}
                  onBlur={() => validate("country", country)}
                  name="country"
                  type="text"
                  required
                  className={inputClass}
                />
                {errors.country && <p className={errorClass}>{errors.country}</p>}
              </div>

              <div>
                <label className={labelClass}>Postal Code *</label>
                <input
                  onChange={(e) => {
                    setPostal(e.target.value);
                    validate("postal_code", e.target.value);
                  }}
                  onBlur={() => validate("postal_code", postal_code)}
                  name="postal_code"
                  type="text"
                  required
                  className={inputClass}
                />
                {errors.postal_code && (
                  <p className={errorClass}>{errors.postal_code}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Program *</label>
                <input
                  onChange={(e) => {
                    setProgram(e.target.value);
                    validate("program", e.target.value);
                  }}
                  onBlur={() => validate("program", program)}
                  name="program"
                  type="text"
                  required
                  className={inputClass}
                />
                {errors.program && <p className={errorClass}>{errors.program}</p>}
              </div>

              <div>
                <label className={labelClass}>Year *</label>
                <input
                    name="year"
                    type="text"
                    required
                    className={inputClass + " uppercase"}
                    value={year}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setYear(val);
                      validate("year", val);
                    }}
                    onBlur={() => validate("year", year)}
                />
                {errors.year && <p className={errorClass}>{errors.year}</p>}
              </div>


              {/* Profile Picture */}
              <div className="md:col-span-2">
                <label className={labelClass}>Profile Picture</label>

                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-300 bg-slate-50">
                    {profilePicPreview ? (
                      <img
                        src={profilePicPreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      name="profile_picture"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="block text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500">
                      Upload a JPG/PNG image (optional).
                    </p>
                  </div>
                </div>

                <input type="hidden" name="profile_picture_url" value={profilePicUrl} />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
