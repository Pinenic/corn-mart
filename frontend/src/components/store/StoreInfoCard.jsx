export default function StoreInfoCard({ store }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-4 space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">About {store.name}</h2>
      <p className="text-gray-700 text-sm leading-relaxed">
        {store.description ||
          "This seller hasn’t added a description yet. Check out their products below!"}
      </p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
        <p>
          <span className="font-medium text-gray-900">Location:</span>{" "}
          {store.location || "Unknown"}
        </p>
        <p>
          <span className="font-medium text-gray-900">Rating:</span>{" "}
          ⭐ {store.rating || "4.8"} / 5
        </p>
        <p>
          <span className="font-medium text-gray-900">Joined:</span>{" "}
          {store.joined || "2024"}
        </p>
      </div>
    </div>
  );
}
