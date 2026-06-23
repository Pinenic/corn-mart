"use client";

import { createContext, useContext, useState } from "react";
import { defaultBrandingConfig } from "@/lib/branding-types";

const BrandingContext = createContext(undefined);

export function BrandingProvider({ children }) {
  const [config, setConfig] = useState(defaultBrandingConfig);

  const updateConfig = (section, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...value,
      },
    }));
  };

  const resetConfig = () => {
    setConfig(defaultBrandingConfig);
  };

  return (
    <BrandingContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
