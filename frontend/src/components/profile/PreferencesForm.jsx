"use client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PreferencesForm({ user }) {
  const [prefs, setPrefs] = useState({
    notifications: true,
    darkMode: false,
    newsletter: true,
  });

  const toggle = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = (e) => {
    e.preventDefault();
    alert("Preferences saved!");
    // TODO: Update Supabase user preferences
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Email Notifications
        </span>
        <Switch checked={prefs.notifications} onCheckedChange={() => toggle("notifications")} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Dark Mode</span>
        <Switch checked={prefs.darkMode} onCheckedChange={() => toggle("darkMode")} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Subscribe to Newsletter</span>
        <Switch checked={prefs.newsletter} onCheckedChange={() => toggle("newsletter")} />
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        Save Preferences
      </Button>
    </form>
  );
}
