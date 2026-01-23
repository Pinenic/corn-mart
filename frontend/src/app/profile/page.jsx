"use client";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import ProfileForm from "@/components/profile/ProfileForm";
import SecurityForm from "@/components/profile/SecurityForm";
import PreferencesForm from "@/components/profile/PreferencesForm";
import { useProfile } from "@/store/useProfile";

export default function ProfilePage() {
  useEffect(() => {
    document.title = 'Profile | Corn Mart';
  }, []);
  const { user } = useAuthStore();
  const { profile } = useProfile();

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">
          You must be logged in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Account Settings
      </h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 border-b">
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm user={profile} />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesForm user={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
