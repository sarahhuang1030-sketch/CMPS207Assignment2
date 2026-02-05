// Forces this page to be rendered on every request (no static generation)
export const dynamic = "force-dynamic";

// Disables ISR caching so data is always fetched fresh
export const revalidate = 0;

import Link from "next/link";
import { getAllUsers } from "./lib/students";

// Home page (Server Component) that lists all students
export default async function HomePage() {
    // Fetch all students from the database on the server
    const students = await getAllUsers();

    return (
        // Page container
        <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                {/* Page title */}
                <h1 className="text-3xl font-bold text-slate-900">
                    New Students
                </h1>

                {/* Link to student creation form */}
                <Link
                    href="/form"
                    className="
            inline-flex items-center gap-2
            rounded-lg bg-blue-600
            px-4 py-2
            text-sm font-semibold text-white
            shadow transition
            hover:bg-blue-700 hover:shadow-md
            active:scale-95
          "
                >
                    ➕ New Student
                </Link>
            </div>

            {/* Student list */}
            <ul className="space-y-4">
                {(students || []).map((s) => (
                    <li
                        key={s.email} // Email is used as a stable unique key
                        className="
              rounded-xl border bg-white p-4
              shadow-sm transition
              hover:shadow-md
            "
                    >
                        {/* Link to individual student detail page */}
                        <Link
                            href={`/students/${encodeURIComponent(s.email)}`}
                            className="text-lg font-medium text-blue-600 hover:underline"
                        >
                            {s.first_name} {s.last_name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
