import Link from "next/link";
import { getAllUsers } from "./lib/students"; // adjust path if needed

export default async function HomePage() {
  const students = await getAllUsers();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Students</h1>

      <ul className="space-y-3">
        {(students || []).map((s) => (
          <li key={s.email} className="bg-white rounded-lg shadow p-4">
            <Link
              href={`/students/${encodeURIComponent(s.email)}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {s.first_name} {s.last_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
