"use client";

import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/lib/authApi";
import { useState } from "react";

export default function Page() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    // e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      await forgotPassword(email);
    } catch (err) {
    //   setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-96">
      {/* <Link
        href={"http://localhost:5000/api/auth/forgot-password"}
        className="text-primary underline"
      >
        Click here{" "}
      </Link>{" "}
      to request a recovery email for your account */}
     <h1>Enter the email of your account</h1> 
      <form
        action={handleSubmit}
        className="flex gap-3 justify-center items-center "
      >
        <input
          id="email"
          name="email"
          type="email"
          required={true}
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-56 border border-gray-300 rounded-lg p-2 dark:bg-muted focus:outline-none focus:ring-2 focus:ring-leafGreen-500"
        />
        <Button
        type="submit"
        className="bg-primary text-white py-2 rounded-lg hover:bg-primary/90 cursor-pointer disabled:opacity-50"
      >
        Send
      </Button>
      </form>
    </div>
  );
}
