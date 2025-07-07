export default function ProfileProgress({ completion }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>
      <div className="flex items-center mb-4">
        <span className="text-sm text-gray-600 mr-2">{completion}% Completed</span>
        <div className="flex-1 bg-gray-200 h-2 rounded">
          <div
            className="bg-green-500 h-2 rounded"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
      <ul className="space-y-3">
        <li className="p-3 bg-green-50 border rounded flex justify-between items-center">
          <span className="font-medium text-green-700">Add availability</span>
          <span className="text-sm text-gray-500">Set your weekly Availability</span>
        </li>
        <li className="p-3 border rounded flex justify-between items-center">
          <span className="font-medium">Complete your profile</span>
          <span className="text-sm text-gray-500">Showcase your expertise</span>
        </li>
        <li className="p-3 border rounded flex justify-between items-center">
          <span className="font-medium">Create a service</span>
          <span className="text-sm text-gray-500">Add services you offer</span>
        </li>
      </ul>
    </div>
  );
}
