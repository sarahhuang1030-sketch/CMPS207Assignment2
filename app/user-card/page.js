import Image from "next/image";


export default function UserCard({ picture, name, id, major, year }) {
  return (
    <div className="bg-white p-6 m-3 rounded-lg shadow-md border">
      <div className="flex flex-col items-center text-center gap-2">
        <Image
          src={picture || "/default.jpg"}
          alt={`${name}'s photo`}
          width={150}
          height={150}
          className="rounded-full object-cover"
          unoptimized
        />

        <h2 className="text-xl font-semibold">{name}</h2>
        <p className="text-gray-600">ID: {id}</p>
        <p className="text-gray-600">Major: {major}</p>
        <p className="text-gray-600">Year: {year}</p>

        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
          Contact
        </button>
      </div>
    </div>
  );
}
