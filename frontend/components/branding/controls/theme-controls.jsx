"use client";

import { useBranding } from "@/lib/branding-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const themePresets = [
  {
    id: "light-minimal",
    name: "Light Minimal",
    colors: ["#FFFFFF", "#F3F4F6", "#1F2937", "#10B981"],
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    colors: ["#111827", "#1F2937", "#F9FAFB", "#10B981"],
  },
  {
    id: "pastel-soft",
    name: "Pastel Soft",
    colors: ["#FEF3C7", "#FDE68A", "#92400E", "#F59E0B"],
  },
  {
    id: "bold-vibrant",
    name: "Bold Vibrant",
    colors: ["#1E1B4B", "#312E81", "#F9FAFB", "#EC4899"],
  },
  {
    id: "monochrome",
    name: "Monochrome",
    colors: ["#FFFFFF", "#E5E7EB", "#111827", "#374151"],
  },
];

export function ThemeControls() {
  const { config, updateConfig } = useBranding();
  const { preset, primaryColor, secondaryColor, backgroundColor, accentColor } =
    config.theme;

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">Theme Preset</Label>
        <div className="grid gap-2">
          {themePresets.map((item) => (
            <button
              key={item.id}
              onClick={() => updateConfig("theme", { preset: item.id })}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                preset === item.id
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{item.name}</span>
                <div className="flex gap-1">
                  {item.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Custom Colors</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="primary-color"
              className="text-xs text-muted-foreground mb-1 block"
            >
              Primary
            </Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) =>
                  updateConfig("theme", { primaryColor: e.target.value })
                }
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) =>
                  updateConfig("theme", { primaryColor: e.target.value })
                }
                className="flex-1 text-xs"
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="secondary-color"
              className="text-xs text-muted-foreground mb-1 block"
            >
              Secondary
            </Label>
            <div className="flex gap-2">
              <Input
                id="secondary-color"
                type="color"
                value={secondaryColor}
                onChange={(e) =>
                  updateConfig("theme", { secondaryColor: e.target.value })
                }
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input
                value={secondaryColor}
                onChange={(e) =>
                  updateConfig("theme", { secondaryColor: e.target.value })
                }
                className="flex-1 text-xs"
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="bg-color"
              className="text-xs text-muted-foreground mb-1 block"
            >
              Background
            </Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={backgroundColor}
                onChange={(e) =>
                  updateConfig("theme", { backgroundColor: e.target.value })
                }
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input
                value={backgroundColor}
                onChange={(e) =>
                  updateConfig("theme", { backgroundColor: e.target.value })
                }
                className="flex-1 text-xs"
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="accent-color"
              className="text-xs text-muted-foreground mb-1 block"
            >
              Accent
            </Label>
            <div className="flex gap-2">
              <Input
                id="accent-color"
                type="color"
                value={accentColor}
                onChange={(e) =>
                  updateConfig("theme", { accentColor: e.target.value })
                }
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input
                value={accentColor}
                onChange={(e) =>
                  updateConfig("theme", { accentColor: e.target.value })
                }
                className="flex-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
