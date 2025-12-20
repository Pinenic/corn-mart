"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/ProfileForm";
import PreferencesForm from "@/components/profile/PreferencesForm";
import { useProfile } from "@/store/useProfile";
import StorefrontTab from "./_components/StorefrontTab";
import StorePreferencesTab from "./_components/StorePreferencesTab";
import { useStoreStore } from "@/store/useStore";
import { updateStore } from "@/lib/storesApi";
import { toast } from "sonner";
import { useState } from "react";

export default function Page() {
  const { profile } = useProfile();
  const {store, loading, fetchStore} = useStoreStore()
  const [updating, setUpdating] = useState(false);

  const updateStoreInfo = async (payload) => {
    setUpdating(true);
    const res = await updateStore(store.id, payload);
    if(!res){
        toast.error("failed to update")
        setUpdating(false);
        return
    }
    toast.success("updated!");
    await fetchStore(profile.id);
    setUpdating(false);

    // res ? toast.success("updated!") : toast.error("failed to update");
  }
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
                  <StorefrontTab user={store} handleUpdate={updateStoreInfo} refreshing={loading} loading={updating} />
                </TabsContent>
        
                <TabsContent value="preferences">
                  <StorePreferencesTab user={profile} />
                </TabsContent>
              </Tabs>
            </div>
    );
}