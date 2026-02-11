"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Renders a grid of student cards with optional CRUD + photo replacement actions
export default function StudentList({ students = [], showActions = false }) {
    // Next.js router used for refreshing server-rendered data after mutations
    const router = useRouter();

    // Tracks which student is currently being edited (by email)
    const [editingEmail, setEditingEmail] = useState(null);

    // Holds a local editable copy of the selected student's fields
    const [editForm, setEditForm] = useState(null);

    // Tracks which student's photo is currently uploading (to disable input + show status)
    const [photoUploadingEmail, setPhotoUploadingEmail] = useState(null);

    // Holds any error message to display at the top of the component
    const [errorMsg, setErrorMsg] = useState(null);

    // Deletes a student by email (calls API route: DELETE /api/students/:email)
    async function handleDelete(email) {
        setErrorMsg(null);

        // Simple user confirmation to prevent accidental deletes
        const ok = confirm(`Delete student: ${email}?`);
        if (!ok) return;

        // Encode email so characters like @ and + are safe in the URL path
        const res = await fetch(`/api/students/${encodeURIComponent(email)}`, {
            method: "DELETE",
        });

        // If the API returns an error, show the response text
        if (!res.ok) {
            setErrorMsg(await res.text());
            return;
        }

        // Refresh the current route so the updated list is fetched/rendered
        router.refresh();
    }

    // Enters "edit mode" for a specific student
    function startEdit(student) {
        setErrorMsg(null);
        setEditingEmail(student.email);

        // Make a shallow copy so edits don’t mutate the original prop object
        setEditForm({ ...student });
    }

    // Exits edit mode and clears local edit state
    function cancelEdit() {
        setEditingEmail(null);
        setEditForm(null);
    }

    // Saves the edited student data (calls API route: PUT /api/students/:email)
    async function saveEdit() {
        setErrorMsg(null);

        const res = await fetch(`/api/students/${encodeURIComponent(editingEmail)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm),
        });

        // Display API error text if update failed
        if (!res.ok) {
            setErrorMsg(await res.text());
            return;
        }

        // Close edit UI and refresh the list
        cancelEdit();
        router.refresh();
    }

    // Uploads a file directly to Azure Blob Storage using a short-lived SAS URL
    async function uploadToAzureBlob(file) {
        // Request a SAS upload URL from the server (keeps keys out of the client)
        const sasRes = await fetch("/api/blob-sas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type || "application/octet-stream",
            }),
        });

        // If SAS generation failed, stop immediately
        if (!sasRes.ok) throw new Error("Failed to get SAS URL");

        // uploadUrl: signed URL used for PUT upload
        // publicUrl: final blob URL used to display the image later
        const { uploadUrl, publicUrl } = await sasRes.json();

        // Upload the file to Azure using the SAS URL
        const putRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "x-ms-blob-type": "BlockBlob", // required header for Azure blob PUT
                "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
        });

        // If upload failed, throw so caller can show an error message
        if (!putRes.ok) throw new Error("Blob upload failed");

        // Return the final blob URL for storing in the database
        return publicUrl;
    }

    // Replaces a student's photo:
    // 1) Upload to Azure Blob Storage
    // 2) Save the new photo URL in the database via PUT /api/students/:email
    async function handleReplacePhoto(studentEmail, file) {
        if (!file) return;
        setErrorMsg(null);

        try {
            // Mark this student as "uploading" to disable their file input
            setPhotoUploadingEmail(studentEmail);

            // Upload file and get back a public URL
            const newUrl = await uploadToAzureBlob(file);

            // Update only the profile_picture_url field in the database
            const res = await fetch(`/api/students/${encodeURIComponent(studentEmail)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profile_picture_url: newUrl }),
            });

            // Convert API error response into a thrown error for catch block
            if (!res.ok) {
                throw new Error(await res.text());
            }

            // Refresh the list so the new image URL appears
            router.refresh();
        } catch (e) {
            // Show a friendly error message to the user
            setErrorMsg(e?.message || "Photo upload failed");
        } finally {
            // Clear uploading state even if upload fails
            setPhotoUploadingEmail(null);
        }
    }

    return (
        <>
            {/* Global error banner */}
            {errorMsg && (
                <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
                    {errorMsg}
                </div>
            )}

            {/* Responsive card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => {
                    // If this student's email matches, show edit UI for this card
                    const isEditing = editingEmail === student.email;

                    return (
                        // Key by email (assumes email is unique)
                        <div key={student.email} className="bg-white rounded-lg shadow-md p-6">
                            {/* Header row: avatar + name + actions */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Image
                                        // Use profile picture if present, otherwise fallback to local image
                                        src={student.profile_picture_url || "/1.jpg"}
                                        alt="Profile"
                                        width={50}
                                        height={50}
                                        className="rounded-full object-cover"

                                        // Disables Next.js image optimization (useful for remote blob URLs without config)
                                        unoptimized
                                    />

                                    <div>
                                        {/* Student name */}
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {student.first_name} {student.last_name}
                                        </h3>

                                        {/* Student email */}
                                        <p className="text-gray-600 text-sm">{student.email}</p>
                                    </div>
                                </div>

                                {/* Edit/Delete or Save/Cancel buttons (only when showActions=true) */}
                                {showActions && (
                                    <div className="flex gap-2">
                                        {!isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => startEdit(student)}
                                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.email)}
                                                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={saveEdit}
                                                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Photo replacement input (only when showActions=true) */}
                            {showActions && (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Replace photo
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"

                                        // Disable only the card that is currently uploading
                                        disabled={photoUploadingEmail === student.email}
                                        onChange={(e) =>
                                            handleReplacePhoto(student.email, e.target.files?.[0] ?? null)
                                        }
                                    />

                                    {/* Upload status message */}
                                    {photoUploadingEmail === student.email && (
                                        <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                                    )}
                                </div>
                            )}

                            {/* Student details section OR edit form */}
                            <div className="mt-4 space-y-1 text-gray-600">
                                {!isEditing ? (
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
                                    // Show input fields only when we have a local editForm object
                                    editForm && (
                                        <div className="grid grid-cols-1 gap-2">
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.first_name ?? ""}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, first_name: e.target.value })
                                                }
                                                placeholder="First name"
                                            />
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.last_name ?? ""}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, last_name: e.target.value })
                                                }
                                                placeholder="Last name"
                                            />
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.phone ?? ""}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                placeholder="Phone"
                                            />
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.street_address ?? ""}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, street_address: e.target.value })
                                                }
                                                placeholder="Street address"
                                            />
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.city ?? ""}
                                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                                placeholder="City"
                                            />
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.province_state ?? ""}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, province_state: e.target.value })
                                                }
                                                placeholder="Province/State"
                                            />
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.country ?? ""}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, country: e.target.value })
                                                }
                                                placeholder="Country"
                                            />
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.postal_code ?? ""}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, postal_code: e.target.value })
                                                }
                                                placeholder="Postal code"
                                            />
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.program ?? ""}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, program: e.target.value })
                                                }
                                                placeholder="Program"
                                            />
                                            <input
                                                className="border rounded px-3 py-2"
                                                value={editForm.year ?? ""}
                                                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                                placeholder="Year"
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
