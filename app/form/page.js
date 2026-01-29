import { getAllUsers } from "../lib/students";
import UsersPage from "../UsersPage/page";

export default async function Page() {
  const students = await getAllUsers();

  return (
    <>
      <UsersPage students={students} />
    </>
  );
}
