"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PencilIcon } from "lucide-react";
import ImageUpdateModal from "./ImageUpdateModal";

export default function StorefrontTab({
  user,
  handleUpdate,
  refreshing,
  loading,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [openLogo, setOpenLogo] = useState(false);
  const [openBanner, setOpenBanner] = useState(false);

  /* -------- Sync store data -------- */
  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name ?? "",
      description: user.description ?? "",
    });
  }, [user]);

  /* -------- Text update only -------- */
  const handleTextUpdate = async () => {
    await handleUpdate({
      name: formData.name,
      description: formData.description,
    });
  };

  /* -------- Image update only -------- */
  const handleImageUpdate = async (type, file) => {
    if (!file) return;

    await handleUpdate({
      [type]: file, // logo OR banner
    });
  };

  return (
    <>
      {/* -------- Banner -------- */}
      <div className="mt-2 border rounded-lg overflow-hidden lg:w-3xl">
        <div className="relative w-full h-56 bg-muted">
          {user?.banner ? (
            <img
              src={user.banner}
              alt="banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Banner preview
            </div>
          )}

          <PencilIcon
            className="absolute top-2 right-2 bg-white text-black rounded-full w-8 h-8 p-2 cursor-pointer"
            onClick={() => setOpenBanner(true)}
          />
        </div>

        {/* -------- Logo -------- */}
        <div className="p-3 flex items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border bg-white">
              {user?.logo ? (
                <img
                  src={user.logo}
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Logo
                </div>
              )}
            </div>

            <PencilIcon
              className="absolute -top-1 -right-3 bg-white text-black border rounded-full w-6 h-6 p-1 cursor-pointer"
              onClick={() => setOpenLogo(true)}
            />
          </div>
        </div>
      </div>

      {/* -------- Text fields -------- */}
      <div className="grid gap-4 lg:w-3xl mt-4">
        <div>
          <label className="text-sm font-medium">Store Name</label>
          <Input
            value={formData.name}
            disabled={loading}
            onChange={(e) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            disabled={loading}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>

        <Button
          className="bg-primary text-white"
          disabled={loading}
          onClick={handleTextUpdate}
        >
          {loading ? "Updating…" : "Save Changes"}
        </Button>

        {refreshing && <p className="text-sm">Refreshing…</p>}
      </div>

      {/* -------- Modals -------- */}
      <ImageUpdateModal
        open={openLogo}
        onOpenChange={setOpenLogo}
        image={user?.logo}
        title="Update logo"
        onSave={(file) => handleImageUpdate("logo", file)}
      />

      <ImageUpdateModal
        open={openBanner}
        onOpenChange={setOpenBanner}
        image={user?.banner}
        title="Update banner"
        onSave={(file) => handleImageUpdate("banner", file)}
      />
    </>
  );
}
