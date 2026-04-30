import Link from "next/link";
import { useState } from "react";

export default function InputField({
  label,
  name,
  type = "text",
  required = true,
  isSignup,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="flex flex-col space-y-1">
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={inputType}
        required={required}
        className="border border-gray-300 rounded-lg p-2 dark:bg-muted focus:outline-none focus:ring-2 focus:ring-leafGreen-500"
      />

      {type === "password" && (
        <div className="flex justify-between mt-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="accent-leafGreen-500"
            />
            Show password
          </label>
          <Link href={'/recovery/forgot-password'} className="text-sm hover:text-primary/90"> Forgot password?</Link> 
        </div>
      )}
    </div>
  );
}
