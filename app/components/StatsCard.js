// Displays a simple "stats" style card showing a student's contact + program info
export default function StatsCard({
    first_name,
    last_name,
    email,
    phone,
    street_address,
    city,
    province_state,
    country,
    postal_code,
    program,
    year,
}) {
    return (
        // Card container styling (Tailwind)
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Row layout for avatar-like block + details */}
            <div className="flex items-center">
                {/* Left "badge" / avatar block */}
                {/* NOTE: `${first_name}` is being used as a CSS class name here.
           If first_name is not an actual Tailwind class (ex: "Jonathan"),
           it won't style anything and could create invalid class names. */}
                <div className={`${first_name} text-white rounded-full p-3 mr-4`}>
                    {/* NOTE: last_name is being displayed where initials/name usually go */}
                    <span className="text-2xl">{last_name}</span>
                </div>

                {/* Primary text area */}
                <div>
                    {/* Email shown as smaller muted text */}
                    <p className="text-sm font-medium text-gray-600">{email}</p>

                    {/* Phone shown as large bold text */}
                    <p className="text-2xl font-bold text-gray-900">{phone}</p>
                </div>

                {/* The following blocks display address + program fields.
            NOTE: These are separate <div>s but there is no spacing class (gap/space-x),
            so they may appear jammed together in one row. */}
                <div>
                    <p className="text-2xl font-bold text-gray-900">{street_address}</p>
                </div>

                <div>
                    <p className="text-2xl font-bold text-gray-900">{city}</p>
                </div>

                <div>
                    <p className="text-2xl font-bold text-gray-900">{province_state}</p>
                </div>

                <div>
                    <p className="text-2xl font-bold text-gray-900">{country}</p>
                </div>

                <div>
                    <p className="text-2xl font-bold text-gray-900">{postal_code}</p>
                </div>

                <div>
                    <p className="text-2xl font-bold text-gray-900">{program}</p>
                </div>

                <div>
                    <p className="text-2xl font-bold text-gray-900">{year}</p>
                </div>
            </div>
        </div>
    );
}
