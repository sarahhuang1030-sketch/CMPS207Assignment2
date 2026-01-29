// import Image from "next/image";
import Link from "next/link";
//let unitDemos = ["1", "2", "3", "4", "5", "6"];
import UsersList from "./user-list/page";
import { getAllUsers } from "../lib/students";
export default async function Home() {
  // return (
  //   <>
  //     {/* <div>Welcome</div> */}

  //     <main className="text-center">
  //       <div className="text-4xl text-center text-red m-4">Welcome!!!</div>
  //       <div className="">
  //         <UsersList />
  //       </div>
  //     </main>
  //   </>
  // );
   const students = await getAllUsers();
  return <UsersList students={students} />;
}
