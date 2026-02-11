// Forces this page to be rendered on every request (no static generation)
export const dynamic = "force-dynamic";

// Disables ISR caching; always fetch fresh data
export const revalidate = 0;

// import Image from "next/image"; // unused currently
import Link from "next/link"; // currently unused (safe to remove if not needed)

// Example demo array (unused)
// let unitDemos = ["1", "2", "3", "4", "5", "6"];

// Imports the UI component/page that renders the list of users/students
import UsersList from "../user-list/page";

// Server-side data function that loads all users/students from the database
import { getAllUsers } from "../lib/students";

// Home page (Server Component by default in the App Router)
// Loads students on the server, then renders the UsersList with that data
export default async function Home() {
    // Previous JSX version of the home page was commented out during iteration
    // return (
    //   <>
    //     <main className="text-center">
    //       <div className="text-4xl text-center text-red m-4">Welcome!!!</div>
    //       <div className="">
    //         <UsersList />
    //       </div>
    //     </main>
    //   </>
    // );

    // Fetch the student list server-side (fresh each request because of dynamic/revalidate config)
    const students = await getAllUsers();

    // Render the list component with students passed in as a prop
    return <UsersList students={students} />;
}
