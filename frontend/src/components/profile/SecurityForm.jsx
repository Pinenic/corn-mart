"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SecurityForm() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    // TODO: Connect to Supabase password update
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Current Password</label>
        <Input
          type="password"
          name="current"
          value={passwords.current}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">New Password</label>
        <Input
          type="password"
          name="new"
          value={passwords.new}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
        <Input
          type="password"
          name="confirm"
          value={passwords.confirm}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        Update Password
      </Button>
    </form>
  );
}
