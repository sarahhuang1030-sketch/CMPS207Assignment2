import UserCard from "../user-card/page";

// Renders a list of users by mapping student records to UserCard components
export default function UsersList({ students = [] }) {
    return (
        <div>
            {students.map((student) => (
                <UserCard
                    // Use a stable unique key (prefer numeric id, fallback to email)
                    key={student.id ?? student.email}

                    // Profile image with a safe fallback
                    picture={student.profile_picture_url || "/default.jpg"}

                    // Display-friendly full name
                    name={`${student.first_name} ${student.last_name}`}

                    // Student identifier (may be undefined if DB does not expose id)
                    id={student.id}

                    // Academic program / major
                    major={student.program}

                    // Academic year
                    year={student.year}
                />
            ))}
        </div>
    );
}
