export default function OrderTrackingStep({ label, date, active, completed }) {
  return (
    <div className="flex items-start gap-3 relative">
      {/* Progress line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-4 h-4 rounded-full border-2 ${
            completed
              ? "border-blue-600 bg-blue-600"
              : active
              ? "border-blue-600 bg-white"
              : "border-gray-300 bg-gray-100"
          }`}
        ></div>
        <div className="w-[2px] h-12 bg-gray-300 mt-1"></div>
      </div>

      {/* Label */}
      <div>
        <p
          className={`font-medium ${
            completed ? "text-blue-700" : active ? "text-gray-800" : "text-gray-500"
          }`}
        >
          {label}
        </p>
        {date && <p className="text-xs text-gray-400">{date}</p>}
      </div>
    </div>
  );
}
