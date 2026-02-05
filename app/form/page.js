// Forces this page to be rendered on every request (no static generation)
export const dynamic = "force-dynamic";

// Disables ISR caching so data is always fetched fresh
export const revalidate = 0;

import { getAllUsers } from "../lib/students";
import UsersPage from "../UsersPage/page";

// Server component page that loads all students and passes them to the UsersPage UI
export default async function Page() {
    // Fetch all students from the database on the server
    const students = await getAllUsers();

    // Render the page component with server-fetched data
    return (
        <>
            <UsersPage students={students} />
        </>
    );
}
