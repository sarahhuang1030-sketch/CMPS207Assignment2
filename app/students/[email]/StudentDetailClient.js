"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Client component that renders a single student's details with edit + delete + photo upload
export default function StudentDetailClient({ student }) {
    // Router used for navigation + refreshing server data after mutations
    const router = useRouter();

    // UI mode toggle between read-only and editable form
    const [mode, setMode] = useState("view"); // "view" | "edit"

    // Local editable copy of the student record
    const [form, setForm] = useState({ ...student });

    // Flags for disabling buttons / showing progress states
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Stores a user-facing error message if anything fails
    const [error, setError] = useState(null);

    // Uploads a file directly to Azure Blob Storage using a server-generated SAS URL
    async function uploadToAzureBlob(file) {
        // Request a SAS URL from the server so account keys never touch the browser
        const sasRes = await fetch("/api/blob-sas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type || "application/octet-stream",
            }),
        });

        // Stop if SAS generation fails
        if (!sasRes.ok) throw new Error("Failed to get SAS URL");

        // uploadUrl = signed PUT URL, publicUrl = final blob URL for display/storage
        const { uploadUrl, publicUrl } = await sasRes.json();

        // Upload the blob with Azure-required headers
        const putRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "x-ms-blob-type": "BlockBlob",
                "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
        });

        // Stop if the upload fails
        if (!putRes.ok) throw new Error("Blob upload failed");

        // Return the public URL so it can be saved in the DB
        return publicUrl;
    }

    // Handles selecting a new photo:
    // 1) Upload to Azure Blob
    // 2) Save the returned URL to the student's DB record
    async function handleReplacePhoto(e) {
        // Pull the first selected file from the input
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        try {
            setUploadingPhoto(true);

            // Upload and get the blob public URL
            const newUrl = await uploadToAzureBlob(file);

            // Persist only profile_picture_url via the students API
            const res = await fetch(`/api/students/${encodeURIComponent(student.email)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profile_picture_url: newUrl }),
            });

            // Convert API failure into an exception for the catch block
            if (!res.ok) throw new Error(await res.text());

            // Update local UI immediately
            setForm((prev) => ({ ...prev, profile_picture_url: newUrl }));

            // Refresh server-rendered data (if the page uses server data)
            router.refresh();
        } catch (err) {
            // Show a friendly message
            setError(err?.message || "Photo update failed");
        } finally {
            // Always clear uploading state
            setUploadingPhoto(false);
        }
    }

    // Saves the edited student form fields back to the database
    async function handleSave() {
        setError(null);

        try {
            setSaving(true);

            // PUT updates fields for this student (email is route key)
            const res = await fetch(`/api/students/${encodeURIComponent(student.email)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            // Convert API failure into an exception for the catch block
            if (!res.ok) throw new Error(await res.text());

            // Return to view mode and refresh data
            setMode("view");
            router.refresh();
        } catch (err) {
            setError(err?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    }

    // Deletes the student record and navigates back to the list
    async function handleDelete() {
        setError(null);

        // Confirm delete to prevent accidental removal
        const ok = confirm(`Delete ${student.email}?`);
        if (!ok) return;

        const res = await fetch(`/api/students/${encodeURIComponent(student.email)}`, {
            method: "DELETE",
        });

        // Show server error text if delete fails
        if (!res.ok) {
            setError(await res.text());
            return;
        }

        // Navigate back to list after delete
        router.push("/");
        router.refresh();
    }

    return (
        // Main card container
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto mt-10">
            {/* Error banner */}
            {error && (
                <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
                    {error}
                </div>
            )}

            {/* Header: avatar + name + action buttons */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex items-center gap-4">
                    {/* Avatar preview */}
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100">
                        {/* Using <img> for simplicity here (works with blob URLs without Next/Image config) */}
                        <img
                            src={form.profile_picture_url || "/1.jpg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Name + email */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {form.first_name} {form.last_name}
                        </h1>

                        {/* Email is treated as the stable identifier; use original student.email */}
                        <p className="text-gray-600">{student.email}</p>
                    </div>
                </div>

                {/* Action buttons: view mode vs edit mode */}
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

                            {/* Cancel restores original student data and exits edit mode */}
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

            {/* Photo replacement controls */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Replace Photo
                </label>

                {/* Styled label triggers hidden file input */}
                <div className="flex items-center gap-4">
                    <label
                        htmlFor="profile-photo-upload"
                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
                    >
                        {uploadingPhoto ? "Uploading..." : "Choose Photo"}
                    </label>

                    {/* Hidden input so the label can be the "button" */}
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

            {/* Details: read-only vs editable input grid */}
            <div className="mt-6 space-y-3 text-gray-700">
                {mode === "view" ? (
                    <>
                        <p>
                            <strong>Phone:</strong> {student.phone}
                        </p>
                        <p>
                            <strong>Address:</strong> {student.street_address}, {student.city},{" "}
                            {student.province_state}, {student.country} {student.postal_code}
                        </p>
                        <p>
                            <strong>Program:</strong> {student.program}
                        </p>
                        <p>
                            <strong>Year:</strong> {student.year}
                        </p>
                    </>
                ) : (
                    // In edit mode, render a list of inputs bound to the local form state
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
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                placeholder={label}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
