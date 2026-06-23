"use client";

import { useState } from "react";
import {
  Eye,
  Save,
  CheckCircle,
  ExternalLink,
  Monitor,
  Smartphone,
  Paintbrush,
  Globe,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Card, PageHeader, Button } from "@/components/ui";
import { BrandingProvider, useBranding } from "@/lib/branding-context";
import { ControlPanel } from "@/components/branding/control-panel";
import { LivePreview } from "@/components/branding/live-preview";
import { StorefrontPreview } from "@/components/branding/StorefrontPreview";

const TABS = [
  { key: "customize", label: "Customize", icon: Paintbrush },
  { key: "preview", label: "Preview", icon: Eye },
];

// ─── Inner page — must be inside BrandingProvider ────────────────────────────
function BrandingPageInner() {
  const { config, resetConfig } = useBranding();

  const [tab, setTab] = useState("customize");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [previewDevice, setDevice] = useState("desktop");

  // Wrap updateConfig so we can track dirty state
  const handleChange = () => {
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: persist config to your API/DB here — `config` has the full object
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Branding"
        description="Customise how your storefront looks and feels"
        action={
          <div className="flex items-center gap-2">
            {saved && (
              <span
                className="flex items-center gap-1.5 text-[12px] font-medium"
                style={{ color: "var(--color-success)" }}
              >
                <CheckCircle size={13} /> Saved
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTab("preview")}
            >
              <Eye size={13} /> Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!dirty}>
              <Save size={13} /> {dirty ? "Save changes" : "Saved"}
            </Button>
          </div>
        }
      />

      {/* ── Status banner ── */}
      <div
        className="flex items-center gap-4 p-4 rounded-xl border mb-5"
        style={{
          borderColor: isPublished
            ? "var(--color-success)"
            : "var(--color-border)",
          background: isPublished
            ? "var(--color-success-bg)"
            : "var(--color-bg)",
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: isPublished
                  ? "var(--color-success)"
                  : "var(--color-text-tertiary)",
              }}
            />
            <p
              className="text-[13px] font-semibold"
              style={{
                color: isPublished
                  ? "var(--color-success)"
                  : "var(--color-text-primary)",
              }}
            >
              {isPublished ? "Your store is live" : "Your store is offline"}
            </p>
          </div>
          <p
            className="text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Theme: {config.theme.preset} · Font: {config.typography.headingFont}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm">
            <ExternalLink size={12} /> Visit store
          </Button>
          <Button
            variant={isPublished ? "danger" : "primary"}
            size="sm"
            onClick={() => setIsPublished((p) => !p)}
          >
            {isPublished ? "Take offline" : "Publish store"}
          </Button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 w-full md:inline-flex"
        style={{
          background: "var(--color-bg)",
          border: "0.5px solid var(--color-border)",
        }}
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all flex-1 md:flex-none justify-center"
              style={
                active
                  ? {
                      background: "white",
                      color: "var(--color-text-primary)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                    }
                  : { color: "var(--color-text-secondary)" }
              }
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── CUSTOMIZE TAB ─── */}
      {tab === "customize" && (
        <div
          className="rounded-xl overflow-hidden border"
          style={{
            borderColor: "var(--color-border)",
            height: "calc(100vh - 260px)",
            minHeight: 520,
          }}
        >
          {/* Two-pane split: control panel left, live preview right */}
          <div
            className="flex h-full"
            onChange={handleChange}
          >
            {/* Control panel — uses the zip's ControlPanel unchanged */}
            <div
              className="w-72 xl:w-80 flex-shrink-0 overflow-auto"
              style={{ borderRight: "1px solid var(--color-border)" }}
            >
              <ControlPanel />
            </div>

            {/* Live preview — uses the zip's LivePreview unchanged */}
            <div className="flex-1 overflow-auto">
              <LivePreview />
            </div>
          </div>
        </div>
      )}

      {/* ─── PREVIEW TAB ─── */}
      {tab === "preview" && (
        <div>
          {/* Device + action bar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p
              className="text-[13px] font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Live preview — reflects your current settings
            </p>
            <div className="flex items-center gap-2">
              <div
                className="flex rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--color-border-md)" }}
              >
                {[
                  { key: "desktop", Icon: Monitor },
                  { key: "mobile", Icon: Smartphone },
                ].map(({ key, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setDevice(key)}
                    className="w-9 h-9 flex items-center justify-center transition-colors"
                    style={{
                      background:
                        previewDevice === key
                          ? "var(--color-accent-subtle)"
                          : "white",
                      color:
                        previewDevice === key
                          ? "var(--color-accent)"
                          : "var(--color-text-tertiary)",
                    }}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTab("customize")}
              >
                <Paintbrush size={13} /> Edit
              </Button>
              {dirty && (
                <Button size="sm" onClick={handleSave}>
                  <Save size={13} /> Save & publish
                </Button>
              )}
            </div>
          </div>

          {/* Preview frame — uses StorefrontPreview which reads the new config */}
          <div
            className={`mx-auto transition-all duration-300 ${
              previewDevice === "mobile" ? "max-w-sm" : "max-w-full"
            }`}
          >
            <StorefrontPreview config={config} />
          </div>

          {dirty && (
            <div className="mt-4 flex items-center gap-2 justify-center">
              <AlertCircle
                size={14}
                style={{ color: "var(--color-warning)" }}
              />
              <p
                className="text-[13px]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                You have unsaved changes.{" "}
                <button
                  onClick={handleSave}
                  className="font-semibold"
                  style={{ color: "var(--color-accent)" }}
                >
                  Save and publish
                </button>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page export — wraps everything in BrandingProvider ──────────────────────
export default function BrandingPage() {
  return (
    <BrandingProvider>
      <BrandingPageInner />
    </BrandingProvider>
  );
}
