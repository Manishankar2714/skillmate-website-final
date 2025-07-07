export default function UserCard({ userName, email }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-green-200">
      <div className="text-2xl font-bold text-green-700 mb-2">Hurray!</div>
      <p className="text-gray-600 mb-4">Your page is ready to announce to public!</p>
      <div className="bg-blue-100 p-4 rounded-md">
        <div className="text-blue-800 font-semibold">{userName}</div>
        <div className="text-sm text-gray-500">{email}</div>
      </div>
      <button
        className="mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-4 rounded"
        onClick={() => navigator.clipboard.writeText(email)}
      >
        Copy Link
      </button>
    </div>
  );
}
