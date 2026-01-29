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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`${first_name} text-white rounded-full p-3 mr-4`}>
          <span className="text-2xl">{last_name}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{email}</p>
          <p className="text-2xl font-bold text-gray-900">{phone}</p>
        </div>
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
