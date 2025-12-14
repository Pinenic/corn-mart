export default function InputField({ label, name, type = "text", required = true }) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="border border-gray-300 rounded-lg p-2 dark:bg-muted focus:outline-none focus:ring-2 focus:ring-leafGreen-500"
      />
    </div>
  );
}
