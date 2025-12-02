"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// shadcn/ui components (adjust the import paths to match your project)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/store/useProfile";
import { toast } from "sonner";
import { createStore } from "@/lib/storesApi";
import AuthGuard from "@/components/auth/AuthGuard";

// Single-file Store Onboarding component
export default function StoreOnboarding() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const userId = profile?.id;

  // Form state
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [category, setCategory] = useState("");

  // Uploads
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else setLogoPreview(null);
  }, [logoFile]);

  useEffect(() => {
    if (bannerFile) {
      const url = URL.createObjectURL(bannerFile);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    } else setBannerPreview(null);
  }, [bannerFile]);

  // basic client-side validation
  const canProceedInfo =
    storeName.trim().length > 1 && category.trim().length > 1;
  const canProceedMedia = logoFile || bannerFile;

  function next() {
    if (step === 1 && !canProceedInfo) return;
    if (step === 2 && !canProceedMedia) return;
    setStep((s) => Math.min(totalSteps, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  // Final submit (placeholder)
  async function handleSubmit() {
    // Replace with API call to create a store
    const payload = {
      name: storeName,
      description: storeDescription,
      category,
      logo: logoFile,
      banner: bannerFile,
    };
    console.log("Submitting store payload:", payload);
    try {
      setLoading(true);
      const res = await createStore(userId, payload);
      res?.store
        ? toast.success(`Success, ${res.message}`)
        : toast.error(`Failure, ${res.message}`);

      setLoading(false);
    } catch (error) {
      console.error("Failed to create store", error.message);
      toast.error("Failed to create store");
    }
  }

  // Animated page variants
  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white p-6 sm:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Wizard */}
            <div className="flex-1">
              <Card className="rounded-2xl shadow-lg overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-semibold">
                        Create your Store
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        A quick step-by-step setup to get your storefront
                        online.
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Step {step} / {totalSteps}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-6">
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-primary-foreground via-primary to-chart-5"
                        style={{
                          width: `${(step / totalSteps) * 100}%`,
                          transition: "width 300ms ease",
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <AnimatePresence exitBeforeEnter>
                      {step === 1 && (
                        <motion.div
                          key="step-1"
                          variants={variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.28 }}
                        >
                          {/* Store Info */}
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="storeName">Store name</Label>
                              <Input
                                id="storeName"
                                placeholder="E.g. Mika's Cakery"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                              />
                            </div>

                            <div>
                              <Label htmlFor="category">Category</Label>
                              <Input
                                id="category"
                                placeholder="E.g. Bakery, Clothing, Electronics"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                              />
                            </div>

                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                placeholder="Short description for your store"
                                value={storeDescription}
                                onChange={(e) =>
                                  setStoreDescription(e.target.value)
                                }
                                className="resize-none"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-4">
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  alert("You can skip this now (demo)")
                                }
                              >
                                Skip
                              </Button>
                              <Button onClick={next} disabled={!canProceedInfo}>
                                Next
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="step-2"
                          variants={variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.28 }}
                        >
                          {/* Media uploads */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label>Logo</Label>
                              <div className="mt-2 flex flex-col items-start gap-3">
                                <div className="w-36 h-36 rounded-lg border border-zinc-100 bg-white flex items-center justify-center overflow-hidden">
                                  {logoPreview ? (
                                    <img
                                      src={logoPreview}
                                      alt="logo preview"
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-center text-sm text-muted-foreground p-2">
                                      Logo preview
                                    </div>
                                  )}
                                </div>

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    setLogoFile(e.target.files?.[0] ?? null)
                                  }
                                />
                                <div className="text-xs text-muted-foreground">
                                  Recommended: square (500x500)
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label>Banner / Cover</Label>
                              <div className="mt-2 flex flex-col items-start gap-3">
                                <div className="w-full h-40 rounded-lg border border-zinc-100 bg-gradient-to-r from-zinc-100 via-white to-zinc-100 overflow-hidden flex items-center justify-center">
                                  {bannerPreview ? (
                                    <img
                                      src={bannerPreview}
                                      alt="banner preview"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-center text-sm text-muted-foreground p-2">
                                      Banner preview
                                    </div>
                                  )}
                                </div>

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    setBannerFile(e.target.files?.[0] ?? null)
                                  }
                                />
                                <div className="text-xs text-muted-foreground">
                                  Recommended: 1200x400 for best results
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 mt-6">
                            <Button variant="ghost" onClick={back}>
                              Back
                            </Button>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setLogoFile(null);
                                  setBannerFile(null);
                                }}
                              >
                                Reset
                              </Button>
                              <Button
                                onClick={next}
                                disabled={!canProceedMedia}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div
                          key="step-3"
                          variants={variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.28 }}
                        >
                          {/* Review / Storefront preview */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Review your store
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Preview how your storefront will look to
                              customers.
                            </p>

                            <div className="mt-4">
                              <div className="border rounded-lg overflow-hidden">
                                {/* Simulated storefront template */}
                                <div className="w-full h-48 relative bg-zinc-50">
                                  {bannerPreview ? (
                                    <img
                                      src={bannerPreview}
                                      alt="store banner"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <svg
                                        className="w-48 h-24"
                                        viewBox="0 0 120 60"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <rect
                                          width="120"
                                          height="60"
                                          fill="#e9e9ee"
                                          rx="6"
                                        />
                                      </svg>
                                    </div>
                                  )}

                                  <div className="absolute -bottom-10 left-6">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white bg-white shadow">
                                      {logoPreview ? (
                                        <img
                                          src={logoPreview}
                                          alt="logo"
                                          className="w-full h-full object-contain"
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center w-full h-full text-sm text-muted-foreground">
                                          Logo
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="p-6 pt-12">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                      <h2 className="text-xl font-semibold">
                                        {storeName || "Store name"}
                                      </h2>
                                      <div className="text-sm text-muted-foreground">
                                        {category || "Category"}
                                      </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground hidden md:block">
                                      Open • 24/7
                                    </div>
                                  </div>

                                  <p className="mt-4 text-sm text-muted-foreground">
                                    {storeDescription ||
                                      "Short description will appear here."}
                                  </p>

                                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* sample product cards */}
                                    {[1, 2, 3].map((i) => (
                                      <div
                                        key={i}
                                        className="border rounded-lg p-3 bg-white"
                                      >
                                        <div className="h-28 bg-zinc-100 rounded-md mb-3 flex items-center justify-center">
                                          Image
                                        </div>
                                        <div className="text-sm font-medium">
                                          Sample product {i}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          $9.{i}9
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex items-center justify-between gap-4 mt-6">
                                    <Button variant="ghost" onClick={back}>
                                      Back
                                    </Button>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          alert(
                                            "Preview full storefront (demo)"
                                          )
                                        }
                                      >
                                        Open Preview
                                      </Button>
                                      <Button onClick={handleSubmit}>
                                        Create Store
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile actions bar */}
              <div className="mt-6 block md:hidden">
                <div className="flex items-center justify-between gap-2">
                  <Button variant="ghost" onClick={back} disabled={step === 1}>
                    Back
                  </Button>
                  <Button onClick={step === totalSteps ? handleSubmit : next}>
                    {step === totalSteps ? "Create" : "Next"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Live preview / helpful tips */}
            <aside className="w-full md:w-96 lg:w-1/3 flex-shrink-0">
              <div className="sticky top-6">
                <Card className="rounded-2xl overflow-hidden shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary-foreground to-primary flex items-center justify-center text-white font-bold">
                          C
                        </div>
                      </Avatar>

                      <div>
                        <div className="text-sm font-medium">Store Setup</div>
                        <div className="text-xs text-muted-foreground">
                          Progress tracker & live preview
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm">
                      <strong>Tip:</strong> Use a clear logo and a horizontal
                      banner image for the best storefront results.
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-muted-foreground">
                        Preview
                      </div>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <div className="w-full h-24 bg-zinc-50 flex items-center justify-center">
                          {bannerPreview ? (
                            <img
                              src={bannerPreview}
                              alt="banner"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Banner preview
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded overflow-hidden border bg-white flex items-center justify-center">
                              {logoPreview ? (
                                <img
                                  src={logoPreview}
                                  alt="logo"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-xs text-muted-foreground">
                                  Logo
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {storeName || "Your store name"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {category || "Category"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-muted-foreground">
                            {storeDescription ||
                              "A short tagline or description will appear here."}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs text-muted-foreground">
                          Completion
                        </div>
                        <div className="mt-2 w-full h-2 bg-zinc-100 rounded-full">
                          <div
                            className="h-2 bg-gradient-to-r from-primary via-primary to-chart-5"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-xs text-muted-foreground">
                        Layout responsive preview
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-8 h-6 border rounded text-xs flex items-center justify-center">
                          M
                        </div>
                        <div className="w-10 h-6 border rounded text-xs flex items-center justify-center">
                          T
                        </div>
                        <div className="w-14 h-6 border rounded text-xs flex items-center justify-center">
                          D
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-4 text-center text-xs text-muted-foreground">
                  Built with Next.js, Tailwind, shadcn/ui & Framer Motion
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
