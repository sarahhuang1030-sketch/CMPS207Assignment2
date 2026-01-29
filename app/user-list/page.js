import UserCard from "../user-card/page";

export default function UsersList({ students = [] }) {
  return (
    <div>
      {students.map((student) => (
        <UserCard
          key={student.id ?? student.email}
          picture={student.profile_picture_url || "/default.jpg"}
          name={`${student.first_name} ${student.last_name}`}
          id={student.id}
          major={student.program}
          year={student.year}
        />
      ))}
    </div>
  );
}
