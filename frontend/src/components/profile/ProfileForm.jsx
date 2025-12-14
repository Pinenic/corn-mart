"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function ProfileForm({ user }) {
  const [formData, setFormData] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    notifications: true,
    darkMode: false,
  });
  const { setTheme } = useTheme()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
    formData.darkMode ? setTheme("dark") : setTheme("light");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile saved successfully!");
    // Later: update Supabase user data
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <img
          src={user?.avatar_url || "/default-avatar.png"}
          alt="User Avatar"
          width={64}
          height={64}
          className="rounded-full object-cover"
        />
        <Button variant="outline">Change Avatar</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Email</label>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled
        />
      </div>

      <div className="pt-4 border-t space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Receive Email Notifications
          </span>
          <Switch
            checked={formData.notifications}
            onCheckedChange={() => handleToggle("notifications")}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Dark Mode</span>
          <Switch
            checked={formData.darkMode}
            onCheckedChange={() => handleToggle("darkMode")}
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        Save Changes
      </Button>
    </form>
  );
}
