"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/ProfileForm";
import PreferencesForm from "@/components/profile/PreferencesForm";
import { useProfile } from "@/store/useProfile";
import StorefrontTab from "./_components/StorefrontTab";
import StorePreferencesTab from "./_components/StorePreferencesTab";
import { useStoreStore } from "@/store/useStore";
import { addLocation, getLocation, updateLocation, updateStore } from "@/lib/storesApi";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Page() {
  const { profile } = useProfile();
  const { store, loading, fetchStore } = useStoreStore();
  const [updating, setUpdating] = useState(false);
  const [storeLocation, setStoreLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(true);

  /* -------- Fetch initial location -------- */
  useEffect(() => {
    if (!store.id) return;

    const fetchLocation = async () => {
      try {
        setInitializing(true);
        const data = await getLocation(store.id);

        // If API returns null / 404, just keep null
        if (data) {
          setStoreLocation(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitializing(false);
      }
    };

    fetchLocation();
  }, [store.id]);

  /* -------- Submit handler -------- */
  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);

      if (storeLocation?.id) {
        // Existing → update
        await updateLocation(store.id, formData);
        toast.success("Location updated");
      } else {
        // New → add
        await addLocation(store.id, formData);
        toast.success("Location added");
      }

      // Refresh local state
      const updated = await getLocation(store.id);
      setStoreLocation(updated);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save location");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStoreInfo = async (payload) => {
    setUpdating(true);
    const res = await updateStore(store.id, payload);
    if (!res) {
      toast.error("failed to update");
      setUpdating(false);
      return;
    }
    toast.success("updated!");
    await fetchStore(profile.id);
    setUpdating(false);

    // res ? toast.success("updated!") : toast.error("failed to update");
  };
  return (
    <div className="max-w-full mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-muted-foreground mb-6">
        Settings
      </h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 border-b">
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <StorefrontTab
            user={store}
            handleUpdate={updateStoreInfo}
            refreshing={loading}
            loading={updating}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <StorePreferencesTab
            value={storeLocation}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
