import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudentByEmail } from "../../lib/students"; // server-side DB fetch helper
import StudentDetailClient from "./StudentDetailClient"; // client component for rendering details

// Server Component page for /students/[email] (or similar dynamic route)
export default async function StudentDetailPage({ params }) {
    // Decode email from the URL (handles %40 for @, etc.)
    const email = decodeURIComponent(params.email);

    // Load student record from DB using the email as a key
    const student = await getStudentByEmail(email);

    // If no student exists for this email, show Next.js 404 page
    if (!student) notFound();

    return (
        // Page container with max width and centered layout
        <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Navigation link back to the main list */}
            <Link href="/" className="text-blue-600 hover:underline">
                ← Back to students
            </Link>

            {/* Student detail content */}
            <div className="mt-6">
                {/* Render details via a client component (useful for interactivity) */}
                <StudentDetailClient student={student} />
            </div>
        </div>
    );
}
