import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudentByEmail } from "../../lib/students"; // adjust if needed
import StudentDetailClient from "./StudentDetailClient";

export default async function StudentDetailPage({ params }) {
  const email = decodeURIComponent(params.email);
  const student = await getStudentByEmail(email);

  if (!student) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/" className="text-blue-600 hover:underline">
        ← Back to students
      </Link>

      <div className="mt-6">
        <StudentDetailClient student={student} />
      </div>
    </div>
  );
}
