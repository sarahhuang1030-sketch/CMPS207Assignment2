"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StudentDetailClient({ student }) {
  const router = useRouter();

  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [form, setForm] = useState({ ...student });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);

  async function uploadToAzureBlob(file) {
    const sasRes = await fetch("/api/blob-sas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      }),
    });

    if (!sasRes.ok) throw new Error("Failed to get SAS URL");
    const { uploadUrl, publicUrl } = await sasRes.json();

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!putRes.ok) throw new Error("Blob upload failed");
    return publicUrl;
  }

  async function handleReplacePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      setUploadingPhoto(true);
      const newUrl = await uploadToAzureBlob(file);

      const res = await fetch(`/api/students/${encodeURIComponent(student.email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_picture_url: newUrl }),
      });

      if (!res.ok) throw new Error(await res.text());

      setForm((prev) => ({ ...prev, profile_picture_url: newUrl }));
      router.refresh();
    } catch (err) {
      setError(err?.message || "Photo update failed");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave() {
    setError(null);
    try {
      setSaving(true);

      const res = await fetch(`/api/students/${encodeURIComponent(student.email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(await res.text());

      setMode("view");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setError(null);
    const ok = confirm(`Delete ${student.email}?`);
    if (!ok) return;

    const res = await fetch(`/api/students/${encodeURIComponent(student.email)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setError(await res.text());
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto mt-10">
        {error && (
            <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
              {error}
            </div>
        )}

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100">
              <img
                  src={form.profile_picture_url || "/1.jpg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {form.first_name} {form.last_name}
              </h1>
              <p className="text-gray-600">{student.email}</p>
            </div>
          </div>

          {/* edit button */}
          <div className="flex gap-2">
            {mode === "view" ? (
                <>
                  <button
                      onClick={() => setMode("edit")}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Edit
                  </button>
                  <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
            ) : (
                <>
                  <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                      onClick={() => {
                        setForm({ ...student });
                        setMode("view");
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </>
            )}
          </div>
        </div>

        {/* change avatar */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Replace Photo
          </label>

          {/* upload avatar */}
          <div className="flex items-center gap-4">
            <label
                htmlFor="profile-photo-upload"
                className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
            >
              {uploadingPhoto ? "Uploading..." : "Choose Photo"}
            </label>
            <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                onChange={handleReplacePhoto}
                className="hidden"
                disabled={uploadingPhoto}
            />
          </div>
        </div>

        {/* detail info */}
        <div className="mt-6 space-y-3 text-gray-700">
          {mode === "view" ? (
              <>
                <p><strong>Phone:</strong> {student.phone}</p>
                <p>
                  <strong>Address:</strong> {student.street_address}, {student.city},{" "}
                  {student.province_state}, {student.country} {student.postal_code}
                </p>
                <p><strong>Program:</strong> {student.program}</p>
                <p><strong>Year:</strong> {student.year}</p>
              </>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  ["first_name", "First name"],
                  ["last_name", "Last name"],
                  ["phone", "Phone"],
                  ["street_address", "Street address"],
                  ["city", "City"],
                  ["province_state", "Province/State"],
                  ["country", "Country"],
                  ["postal_code", "Postal code"],
                  ["program", "Program"],
                  ["year", "Year"],
                ].map(([key, label]) => (
                    <input
                        key={key}
                        className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        value={form[key] ?? ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={label}
                    />
                ))}
              </div>
          )}
        </div>
      </div>
  );
}
