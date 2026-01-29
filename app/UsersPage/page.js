"use client";
import { useRouter } from "next/navigation";
import { UserAction } from "../lib/action";
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
  // Ask your Next.js API route for a SAS upload URL
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

  // Upload directly to Azure Blob
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

  return publicUrl; // store this in DB
}

async function handleSubmit(e) {
  e.preventDefault();
  setUploadError(null);

  try {
    setUploading(true);

    // build form data from the form fields
    const formData = new FormData(e.currentTarget);

    // if user picked a file, upload first
    if (profilePic) {
      const url = await uploadToAzureBlob(profilePic);
      setProfilePicUrl(url);

      // add url into the form submission payload
      formData.set("profile_picture_url", url);
    }
    console.log("submitting...");
    // Now send the data to your server to create the student.
    // OPTION A (recommended): call an API route that creates the student
    const res = await fetch("/api/students", {
      method: "POST",
      body: formData,
    });
    console.log("Student API status:", res.status);
    if (!res.ok) {
  const msg = await res.text();
  throw new Error(msg || "Saving student failed");
}

    // optional: reset form
    // e.currentTarget.reset();
    // setProfilePic(null);
    // setProfilePicPreview(null);
    // setProfilePicUrl("");
    router.push("/");
    router.refresh();
  //  console.log("Redirecting to / now. Current path:", window.location.pathname);
   // window.location.replace("/");
  } catch (err) {
    setUploadError(err.message || "Something went wrong");
  } finally {
    setUploading(false);
  }
}


  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Students</h1>

        <form
         // action={UserAction}
         onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Add Student</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frist Name *
              </label>
              <input
                name="first_name"
                onChange={(e) => {
                  setFirstname(e.target.value);
                  validate("first_name", e.target.value);
                }}
                onBlur={() => validate("first_name", first_name)}
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.first_name && (
                <span className="error">{errors.first_name}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                onChange={(e) => {
                  setLastname(e.target.value);
                  validate("last_name", e.target.value);
                }}
                onBlur={() => validate("last_name", last_name)}
                name="last_name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.last_name && (
                <span className="error">{errors.last_name}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                onChange={(e) => {
                  setPhone(e.target.value);
                  validate("phone", e.target.value);
                }}
                onBlur={() => validate("phone", phone)}
                name="phone"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                onChange={(e) => {
                  setEmail(e.target.value);
                  validate("email", e.target.value);
                }}
                onBlur={() => validate("email", email)}
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street *
              </label>
              <input
                onChange={(e) => {
                  setStreet(e.target.value);
                  validate("street_address", e.target.value);
                }}
                onBlur={() => validate("street_address", street_address)}
                name="street_address"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>{" "}
            {errors.street_address && (
              <span className="error">{errors.street_address}</span>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />{" "}
              {errors.city && <span className="error">{errors.city}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province *
              </label>
              <input
                onChange={(e) => {
                  setProvince(e.target.value);
                  validate("province_state", e.target.value);
                }}
                onBlur={() => validate("province_state", province_state)}
                name="province_state"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.province_state && (
                <span className="error">{errors.province_state}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                onChange={(e) => {
                  setCountry(e.target.value);
                  validate("country", e.target.value);
                }}
                onBlur={() => validate("country", country)}
                name="country"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.country && (
                <span className="error">{errors.country}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                onChange={(e) => {
                  setPostal(e.target.value);
                  validate("postal_code", e.target.value);
                }}
                onBlur={() => validate("postal_code", postal_code)}
                name="postal_code"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.postal_code && (
                <span className="error">{errors.postal_code}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program *
              </label>
              <input
                onChange={(e) => {
                  setProgram(e.target.value);
                  validate("program", e.target.value);
                }}
                onBlur={() => validate("program", program)}
                name="program"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.program && (
                <span className="error">{errors.program}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                onChange={(e) => {
                  setYear(e.target.value);
                  validate("year", e.target.value);
                }}
                onBlur={() => validate("year", year)}
                name="year"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.year && <span className="error">{errors.year}</span>}
            </div>

            <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Profile Picture
  </label>

  <div className="flex items-center gap-4">
    <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center">
      {profilePicPreview ? (
        <img
          src={profilePicPreview}
          alt="Profile preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs text-gray-400">No image</span>
      )}
    </div>

    <input
      type="file"
      name="profile_picture"
      accept="image/*"
      onChange={handleProfilePicChange}
      className="block"
    />
  </div>
      <input type="hidden" name="profile_picture_url" value={profilePicUrl} />

  <p className="text-xs text-gray-500 mt-2">
    Upload a JPG/PNG image (optional).
  </p>
</div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
        <div>
        
        </div>
      </div>
    </>
  );
}
