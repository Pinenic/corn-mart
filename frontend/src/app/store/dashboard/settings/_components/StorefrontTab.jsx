"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PencilIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ImageUpdateModal from "./ImageUpdateModal";

export default function StorefrontTab({ user, handleUpdate, refreshing, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [openl, setOpenL] = useState(false);
  const [openb, setOpenB] = useState(false);
  // Uploads
  const [logoFile, setLogoFile] = useState(null);
//   const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
//   const [bannerPreview, setBannerPreview] = useState(null);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log(logoFile);
    const payload = {
      name: formData.name,
      description: formData.description,
      logo: logoFile,
      banner: bannerFile,
    };
    await handleUpdate(payload)

  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        description: user.description,
      });
      setErrors({});
    }
  }, [user]);

  return (
    <>
      <div className="mt-2 border rounded-lg overflow-hidden lg:w-3xl">
        <div className="relative w-full h-56 bg-zinc-50 flex items-center justify-center">
          {user?.banner ? (
            <img
              src={user?.banner}
              alt="banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-sm text-muted-foreground">Banner preview</div>
          )}
          <PencilIcon className="absolute top-1 right-1 bg-white/70 text-black text-xs rounded-full w-10 h-10 p-3 flex items-center justify-center hover:cursor-pointer" onClick={()=> setOpenB(true)}  />
        </div>

        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className=" w-15 h-15 rounded-full overflow-hidden border bg-white flex items-center justify-center">
                {user?.logo ? (
                  <img
                    src={user?.logo}
                    alt="logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground">Logo</div>
                )}
                <PencilIcon className="absolute -top-1 -right-3 bg-white border text-black text-xs rounded-full w-6 h-6 p-1 flex items-center justify-center hover:cursor-pointer" onClick={()=> setOpenL(true)} />
              </div>
            </div>
            {/* <div className="flex-1">
              <div className="text-sm font-medium">
                {storeName || "Your store name"}
              </div>
              <div className="text-xs text-muted-foreground">
                {category || "Category"}
              </div>
            </div> */}
          </div>

          {/* <div className="mt-3 text-xs text-muted-foreground">
            {storeDescription ||
              "A short tagline or description will appear here."}
          </div> */}
        </div>
      </div>
      {/* <div className="flex items-center gap-4">
        <img
          src={user?.avatar_url || "/default-avatar.png"}
          alt="User Avatar"
          width={64}
          height={64}
          className="rounded-full object-cover"
        />
        <Button variant="outline">Change Avatar</Button>
      </div> */}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Store Name
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Category
          </label>
          <Input
            name="name"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>
      </div> */}

      <div className="lg:w-3xl">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <Button
        className="w-full lg:w-3xl bg-primary hover:primary/70 text-white mt-5"
        onClick={()=> handleSubmit()}
      >
        {loading ? "Updating info...":"Save Changes"}
      </Button>

      {refreshing ? <p>Refreshing...</p> : "" }

      <ImageUpdateModal 
        open={openl}
        onOpenChange={setOpenL}
        submit={handleSubmit}
        image={user?.logo}
        onFile={setLogoFile}
        mainFile={logoFile}
        title="logo update"
        />

        <ImageUpdateModal 
        open={openb}
        onOpenChange={setOpenB}
        submit={handleSubmit}
        image={user?.banner}
        onFile={setBannerFile}
        mainFile={bannerFile}
        title="banner update"
        />
    </>
  );
}
