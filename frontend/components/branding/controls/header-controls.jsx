"use client";

import { useBranding } from "@/lib/branding-context";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const headerLayouts = [
  {
    id: "logo-left",
    name: "Logo Left",
    description: "Logo left, nav center, icons right",
  },
  {
    id: "logo-center",
    name: "Logo Center",
    description: "Logo center, nav below",
  },
  { id: "minimal", name: "Minimal", description: "Logo + cart only" },
  {
    id: "sidebar-style",
    name: "Sidebar Style",
    description: "Menu icon + logo",
  },
  {
    id: "transparent-overlay",
    name: "Transparent",
    description: "Overlay header",
  },
];

export function HeaderControls() {
  const { config, updateConfig } = useBranding();
  const { layout, showCart, showSearch } = config.header;

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">Layout Style</Label>
        <div className="grid gap-2">
          {headerLayouts.map((item) => (
            <button
              key={item.id}
              onClick={() => updateConfig("header", { layout: item.id })}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                layout === item.id
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Display Options</Label>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-cart" className="text-sm text-muted-foreground">
            Show Cart Icon
          </Label>
          <Switch
            id="show-cart"
            checked={showCart}
            onCheckedChange={(checked) =>
              updateConfig("header", { showCart: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="show-search"
            className="text-sm text-muted-foreground"
          >
            Show Search Icon
          </Label>
          <Switch
            id="show-search"
            checked={showSearch}
            onCheckedChange={(checked) =>
              updateConfig("header", { showSearch: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}
