"use client";

import { useRouter } from "next/navigation";
import { UserAction } from "../lib/action"; // kept (even if unused) to avoid breaking imports
import { useState, useEffect } from "react";

// Client page component that:
// - renders a form to create a student
// - optionally uploads a profile picture to Azure Blob Storage
// - submits the student data to POST /api/students
export default function UsersPage({ students }) {
    // NOTE: students prop is currently unused in this component (could be used to render a list later)

    // Router used for navigation and refreshing server-rendered data after submission
    const router = useRouter();

    // Controlled form state (used mainly for validation + UI)
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

    // Per-field validation errors (key = field name, value = message or null)
    const [errors, setErrors] = useState({});

    // Unused state placeholders (safe to remove if not needed)
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Profile picture upload state
    const [profilePic, setProfilePic] = useState(null); // actual File object
    const [profilePicPreview, setProfilePicPreview] = useState(null); // local preview URL
    const [profilePicUrl, setProfilePicUrl] = useState(""); // final Azure blob URL

    // Upload workflow state
    const [uploading, setUploading] = useState(false); // disables submit button
    const [uploadError, setUploadError] = useState(null); // displays an error banner

    // Handles selecting a photo file and generating a local preview URL
    const handleProfilePicChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setProfilePic(file);

        // Create a browser-local preview URL for the selected file
        if (file) {
            const url = URL.createObjectURL(file);
            setProfilePicPreview(url);
        } else {
            setProfilePicPreview(null);
        }
    };

    // Validation patterns for specific inputs
    const patterns = {
        // Letters (upper/lower), accents, apostrophes, hyphens; min 2 chars
        first_name: /^[a-zA-Z\u00C0-\u00FF'-]{2,}$/,
        last_name: /^[a-zA-Z\u00C0-\u00FF'-]{2,}$/,

        // NOTE: This regex requires EXACTLY 10 characters of digits/spaces/()-,
        // not "at least 10 digits" (message below doesn't match the regex).
        phone: /^[\d\s\-\(\)]{10}$/,

        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

        // Year format like "Y1", "Y2", "Y3", "Y4"
        year: /^y[1-4]$/i,

        // Canadian postal code format (e.g., T2N 1N4)
        postalcode: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    };

    // Validates one field at a time and updates errors state
    const validate = (field, value) => {
        try {
            // Required check
            if (!value) {
                setErrors((prev) => ({ ...prev, [field]: `${field} is required.` }));
            }

            // Pattern check (only runs if a regex exists for this field)
            else if (patterns[field] && !patterns[field].test(value)) {
                // Friendly per-field error messages
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
                    postal_code: "Postal code must follow Canadian format (e.g., T2N 1N4).",
                };

                setErrors((prev) => ({ ...prev, [field]: messages[field] }));
            } else {
                // Clear error if validation passes
                setErrors((prev) => ({ ...prev, [field]: null }));
            }
        } catch (err) {
            // Catch unexpected errors so validation never crashes the page
            console.error(`Validation error for ${field}:`, err);
            setErrors((prev) => ({
                ...prev,
                [field]: `Error validating ${field}`,
            }));
        }
    };

    // Uploads a file to Azure Blob Storage using a server-generated SAS URL
    async function uploadToAzureBlob(file) {
        // Request SAS URL from the server (keeps Azure keys out of the browser)
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

        // uploadUrl = signed PUT URL for uploading, publicUrl = final blob URL
        const { uploadUrl, publicUrl } = await sasRes.json();

        // Upload the file directly to Azure using the SAS URL
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

    // Handles form submission:
    // - uploads picture (optional)
    // - posts the FormData to /api/students
    async function handleSubmit(e) {
        e.preventDefault();
        setUploadError(null);

        try {
            setUploading(true);

            // Grab form values from the actual DOM form
            const formData = new FormData(e.currentTarget);

            // If a picture was selected, upload it first and store URL into formData
            if (profilePic) {
                const url = await uploadToAzureBlob(profilePic);
                setProfilePicUrl(url);

                // Ensure the API receives the final URL
                formData.set("profile_picture_url", url);
            }

            console.log("submitting...");

            // Send multipart/form-data to the API route that inserts the student row
            const res = await fetch("/api/students", {
                method: "POST",
                body: formData,
            });

            console.log("Student API status:", res.status);

            // Convert non-OK API responses into thrown errors
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Saving student failed");
            }

            // After success: go back to home/list and refresh displayed data
            router.push("/");
            router.refresh();
        } catch (err) {
            // Store a friendly message in UI
            setUploadError(err.message || "Something went wrong");
        } finally {
            setUploading(false);
        }
    }

    // Shared Tailwind classes for consistency
    const labelClass = "block text-sm font-medium text-slate-700";
    const inputClass =
        "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";
    const errorClass = "mt-2 text-sm text-red-600";

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="mx-auto max-w-5xl">
                {/* Page title */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Students</h1>
                    <p className="mt-1 text-slate-600">
                        Create a new student record and optionally upload a profile picture.
                    </p>
                </div>

                {/* Student creation form */}
                <form onSubmit={handleSubmit} className="rounded-2xl border bg-white shadow-sm">
                    <div className="border-b px-6 py-5">
                        <h2 className="text-xl font-semibold text-slate-900">Add Student</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Fields marked with * are required.
                        </p>
                    </div>

                    <div className="px-6 py-6">
                        {/* Upload / submit error banner */}
                        {uploadError && (
                            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {uploadError}
                            </div>
                        )}

                        {/* Responsive two-column form layout */}
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
                                        // Convert input to uppercase so it matches the Y1/Y2 format
                                        const val = e.target.value.toUpperCase();
                                        setYear(val);
                                        validate("year", val);
                                    }}
                                    onBlur={() => validate("year", year)}
                                />
                                {errors.year && <p className={errorClass}>{errors.year}</p>}
                            </div>

                            {/* Profile Picture (optional) */}
                            <div className="md:col-span-2">
                                <label className={labelClass}>Profile Picture</label>

                                <div className="mt-2 flex items-center gap-4">
                                    {/* Image preview circle */}
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

                                    {/* File input */}
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            name="profile_picture" // NOTE: not sent to DB; only used to pick a file locally
                                            accept="image/*"
                                            onChange={handleProfilePicChange}
                                            className="block text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                                        />
                                        <p className="text-xs text-slate-500">
                                            Upload a JPG/PNG image (optional).
                                        </p>
                                    </div>
                                </div>

                                {/* Hidden field that carries the final Azure blob URL to the API */}
                                <input type="hidden" name="profile_picture_url" value={profilePicUrl} />
                            </div>
                        </div>

                        {/* Submit button */}
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
