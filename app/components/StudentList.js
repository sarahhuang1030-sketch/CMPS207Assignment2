"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StudentList({ students = [], showActions = false }) {
  const router = useRouter();

  const [editingEmail, setEditingEmail] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [photoUploadingEmail, setPhotoUploadingEmail] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  async function handleDelete(email) {
    setErrorMsg(null);
    const ok = confirm(`Delete student: ${email}?`);
    if (!ok) return;

    const res = await fetch(`/api/students/${encodeURIComponent(email)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setErrorMsg(await res.text());
      return;
    }

    router.refresh();
  }

  function startEdit(student) {
    setErrorMsg(null);
    setEditingEmail(student.email);
    setEditForm({ ...student }); // local copy
  }

  function cancelEdit() {
    setEditingEmail(null);
    setEditForm(null);
  }

  async function saveEdit() {
    setErrorMsg(null);

    const res = await fetch(`/api/students/${encodeURIComponent(editingEmail)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (!res.ok) {
      setErrorMsg(await res.text());
      return;
    }

    cancelEdit();
    router.refresh();
  }

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

  async function handleReplacePhoto(studentEmail, file) {
    if (!file) return;
    setErrorMsg(null);

    try {
      setPhotoUploadingEmail(studentEmail);

      const newUrl = await uploadToAzureBlob(file);

      // update only the photo URL in DB
      const res = await fetch(`/api/students/${encodeURIComponent(studentEmail)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_picture_url: newUrl }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      router.refresh();
    } catch (e) {
      setErrorMsg(e?.message || "Photo upload failed");
    } finally {
      setPhotoUploadingEmail(null);
    }
  }

  return (
    <>
      {errorMsg && (
        <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => {
          const isEditing = editingEmail === student.email;

          return (
            <div key={student.email} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={student.profile_picture_url || "/1.jpg"} // use an existing local fallback
                    alt="Profile"
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                    unoptimized
                  />

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-gray-600 text-sm">{student.email}</p>
                  </div>
                </div>

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

              {/* Replace photo */}
              {showActions && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Replace photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={photoUploadingEmail === student.email}
                    onChange={(e) =>
                      handleReplacePhoto(student.email, e.target.files?.[0] ?? null)
                    }
                  />
                  {photoUploadingEmail === student.email && (
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  )}
                </div>
              )}

              {/* Details / edit form */}
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
