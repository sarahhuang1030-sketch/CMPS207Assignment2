import Image from "next/image";

// Reusable card component for displaying a user's basic profile information
export default function UserCard({ picture, name, id, major, year }) {
    return (
        // Card container styling
        <div className="bg-white p-6 m-3 rounded-lg shadow-md border">
            {/* Centered vertical layout */}
            <div className="flex flex-col items-center text-center gap-2">
                {/* Profile image (fallback to default if none provided) */}
                <Image
                    src={picture || "/default.jpg"}
                    alt={`${name}'s photo`}
                    width={150}
                    height={150}
                    className="rounded-full object-cover"

                    // Disabled optimization to allow remote / dynamic image sources
                    unoptimized
                />

                {/* User name */}
                <h2 className="text-xl font-semibold">{name}</h2>

                {/* Additional user details */}
                <p className="text-gray-600">ID: {id}</p>
                <p className="text-gray-600">Major: {major}</p>
                <p className="text-gray-600">Year: {year}</p>

                {/* Action button (currently no click handler attached) */}
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Contact
                </button>
            </div>
        </div>
    );
}
