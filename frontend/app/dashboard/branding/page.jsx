"use client";

import { useState } from "react";
import {
  Globe,
  Paintbrush,
  Eye,
  Upload,
  Check,
  Save,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Instagram,
  Twitter,
  Facebook,
  RefreshCw,
  Monitor,
  Smartphone,
  Type,
  Palette,
  Layout,
  Link2,
  AlignLeft,
} from "lucide-react";
import { Card, PageHeader, Button, Badge } from "@/components/ui";
import { StorefrontPreview } from "@/components/branding/StorefrontPreview";
import {
  DEFAULT_BRANDING,
  ACCENT_COLORS,
  FONTS,
  THEMES,
} from "@/lib/branding-data";

const TABS = [
  { key: "overview", label: "Overview", icon: Globe },
  { key: "customize", label: "Customize", icon: Paintbrush },
  { key: "preview", label: "Preview", icon: Eye },
];

const CUSTOMIZE_SECTIONS = [
  { key: "identity", label: "Identity", icon: Type },
  { key: "visuals", label: "Colours & fonts", icon: Palette },
  { key: "hero", label: "Hero section", icon: Layout },
  { key: "announce", label: "Announcement bar", icon: AlertCircle },
  { key: "social", label: "Social links", icon: Link2 },
  { key: "footer", label: "Footer", icon: AlignLeft },
  { key: "seo", label: "SEO", icon: Globe },
];

function Field({ label, hint, children }) {
  return (
    <div className="mb-4">
      <label
        className="text-[12px] font-medium block mb-1.5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p
          className="text-[11px] mt-1"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "w-full h-9 px-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]";
const inputStyle = {
  borderColor: "var(--color-border-md)",
  color: "var(--color-text-primary)",
  background: "white",
};

function UploadZone({ label }) {
  return (
    <div
      className="h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-[var(--color-accent)]"
      style={{
        borderColor: "var(--color-border-md)",
        background: "var(--color-bg)",
      }}
    >
      <Upload size={16} style={{ color: "var(--color-text-tertiary)" }} />
      <span
        className="text-[11px]"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        Upload {label}
      </span>
    </div>
  );
}

export default function BrandingPage() {
  const [tab, setTab] = useState("overview");
  const [activeSection, setSection] = useState("identity");
  const [branding, setBranding] = useState({ ...DEFAULT_BRANDING });
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewDevice, setDevice] = useState("desktop");

  const update = (field, value) => {
    setBranding((b) => ({ ...b, [field]: value }));
    setDirty(true);
    setSaved(false);
  };

  const updateNested = (parent, field, value) => {
    setBranding((b) => ({ ...b, [parent]: { ...b[parent], [field]: value } }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const lastUpdated = new Date(branding.last_updated).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

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

      {/* Tab bar */}
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

      {/* ─── OVERVIEW TAB ─── */}
      {tab === "overview" && (
        <div className="space-y-5">
          {/* Status banner */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl border"
            style={{
              borderColor: branding.is_published
                ? "var(--color-success)"
                : "var(--color-border)",
              background: branding.is_published
                ? "var(--color-success-bg)"
                : "var(--color-bg)",
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: branding.is_published
                      ? "var(--color-success)"
                      : "var(--color-text-tertiary)",
                  }}
                />
                <p
                  className="text-[13px] font-semibold"
                  style={{
                    color: branding.is_published
                      ? "var(--color-success)"
                      : "var(--color-text-primary)",
                  }}
                >
                  {branding.is_published
                    ? "Your store is live"
                    : "Your store is offline"}
                </p>
              </div>
              <p
                className="text-[12px]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {branding.domain} · Last updated {lastUpdated}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm">
                <ExternalLink size={12} /> Visit store
              </Button>
              <Button
                variant={branding.is_published ? "danger" : "primary"}
                size="sm"
                onClick={() => update("is_published", !branding.is_published)}
              >
                {branding.is_published ? "Take offline" : "Publish store"}
              </Button>
            </div>
          </div>

          {/* Quick stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Theme",
                value:
                  THEMES.find((t) => t.value === branding.theme)?.label ??
                  "Minimal",
                action: "customize",
              },
              {
                label: "Brand colour",
                value: branding.accent_color.toUpperCase(),
                action: "customize",
              },
              { label: "Font", value: branding.font, action: "customize" },
              {
                label: "Announcement",
                value: branding.announcement_enabled ? "On" : "Off",
                action: "customize",
              },
            ].map((s) => (
              <Card
                key={s.label}
                className="cursor-pointer hover:border-[var(--color-accent-text)] transition-colors"
                onClick={() => {
                  setTab("customize");
                  setSection("visuals");
                }}
              >
                <p
                  className="text-[11px] font-medium mb-1.5"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {s.label}
                </p>
                <div className="flex items-center gap-2">
                  {s.label === "Brand colour" && (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ background: branding.accent_color }}
                    />
                  )}
                  <p
                    className="text-[13px] font-semibold truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {s.value}
                  </p>
                </div>
                <p
                  className="text-[11px] mt-2"
                  style={{ color: "var(--color-accent)" }}
                >
                  Edit →
                </p>
              </Card>
            ))}
          </div>

          {/* Sections overview */}
          <Card noPadding>
            <div
              className="px-5 py-3.5 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p
                className="text-[14px] font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Customisation sections
              </p>
            </div>
            <div
              className="divide-y"
              style={{ borderColor: "var(--color-border)" }}
            >
              {CUSTOMIZE_SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      setTab("customize");
                      setSection(s.key);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--color-bg)]"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--color-accent-subtle)",
                        color: "var(--color-accent)",
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <p
                      className="flex-1 text-[13px] font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {s.label}
                    </p>
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      ›
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ─── CUSTOMIZE TAB ─── */}
      {tab === "customize" && (
        <div className="flex gap-5 flex-col md:flex-row">
          {/* Section sidebar */}
          <div className="md:w-48 flex-shrink-0">
            <div
              className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0"
              style={{ scrollbarWidth: "none" }}
            >
              {CUSTOMIZE_SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = activeSection === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSection(s.key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap md:whitespace-normal flex-shrink-0 md:flex-shrink"
                    style={{
                      background: active
                        ? "var(--color-accent-subtle)"
                        : "transparent",
                      color: active
                        ? "var(--color-accent-text)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    <Icon size={13} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section form */}
          <div className="flex-1 min-w-0">
            <Card>
              {/* ── Identity ── */}
              {activeSection === "identity" && (
                <div>
                  <p
                    className="text-[14px] font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Store identity
                  </p>
                  <Field label="Store name">
                    <input
                      value={branding.store_name}
                      onChange={(e) => update("store_name", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                  <Field
                    label="Tagline"
                    hint="Shown in the hero section and browser tab"
                  >
                    <input
                      value={branding.tagline}
                      onChange={(e) => update("tagline", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Short description">
                    <textarea
                      value={branding.description}
                      onChange={(e) => update("description", e.target.value)}
                      rows={3}
                      className={`${inputCls} resize-none py-2 h-auto`}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Domain">
                    <input
                      value={branding.domain}
                      onChange={(e) => update("domain", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    {[
                      { label: "Logo", key: "logo" },
                      { label: "Favicon (32×32)", key: "favicon" },
                      { label: "OG image", key: "og" },
                    ].map((u) => (
                      <div key={u.key}>
                        <p
                          className="text-[11px] font-medium mb-1.5"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {u.label}
                        </p>
                        <UploadZone label={u.label.toLowerCase()} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Visuals ── */}
              {activeSection === "visuals" && (
                <div>
                  <p
                    className="text-[14px] font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Colours & fonts
                  </p>

                  {/* Theme */}
                  <Field
                    label="Theme"
                    hint="Sets the overall look of your storefront"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {THEMES.map((t) => {
                        const active = branding.theme === t.value;
                        return (
                          <button
                            key={t.value}
                            onClick={() => update("theme", t.value)}
                            className="flex flex-col items-start p-3 rounded-xl border text-left transition-all"
                            style={{
                              borderColor: active
                                ? "var(--color-accent)"
                                : "var(--color-border)",
                              background: active
                                ? "var(--color-accent-subtle)"
                                : "transparent",
                            }}
                          >
                            <p
                              className="text-[12px] font-semibold"
                              style={{
                                color: active
                                  ? "var(--color-accent-text)"
                                  : "var(--color-text-primary)",
                              }}
                            >
                              {t.label}
                            </p>
                            <p
                              className="text-[11px]"
                              style={{ color: "var(--color-text-tertiary)" }}
                            >
                              {t.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Accent colour */}
                  <Field label="Brand colour">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ACCENT_COLORS.map((c) => {
                        const active = branding.accent_color === c.hex;
                        return (
                          <button
                            key={c.hex}
                            onClick={() => update("accent_color", c.hex)}
                            title={c.name}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                            style={{
                              background: c.hex,
                              border: active
                                ? "2.5px solid var(--color-text-primary)"
                                : "2px solid transparent",
                              outline: active ? `3px solid ${c.hex}40` : "none",
                            }}
                          >
                            {active && (
                              <Check size={12} color="white" strokeWidth={3} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* Custom hex input */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border flex-shrink-0"
                        style={{
                          background: branding.accent_color,
                          borderColor: "var(--color-border-md)",
                        }}
                      />
                      <input
                        value={branding.accent_color}
                        onChange={(e) => update("accent_color", e.target.value)}
                        placeholder="#000000"
                        className="flex-1 h-8 px-2.5 rounded-lg border text-[12px] font-mono outline-none focus:border-[var(--color-accent)] transition-colors"
                        style={{
                          borderColor: "var(--color-border-md)",
                          color: "var(--color-text-primary)",
                        }}
                      />
                    </div>
                  </Field>

                  {/* Font */}
                  <Field label="Storefront font">
                    <div className="grid grid-cols-1 gap-2">
                      {FONTS.map((f) => {
                        const active = branding.font === f.value;
                        return (
                          <button
                            key={f.value}
                            onClick={() => update("font", f.value)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all"
                            style={{
                              borderColor: active
                                ? "var(--color-accent)"
                                : "var(--color-border)",
                              background: active
                                ? "var(--color-accent-subtle)"
                                : "transparent",
                            }}
                          >
                            <p
                              className="text-[15px] flex-1"
                              style={{
                                fontFamily: f.stack,
                                color: "var(--color-text-primary)",
                              }}
                            >
                              {f.label}
                            </p>
                            <p
                              className="text-[11px]"
                              style={{
                                fontFamily: f.stack,
                                color: "var(--color-text-tertiary)",
                              }}
                            >
                              The quick brown fox
                            </p>
                            {active && (
                              <Check
                                size={13}
                                style={{
                                  color: "var(--color-accent)",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              )}

              {/* ── Hero ── */}
              {activeSection === "hero" && (
                <div>
                  <p
                    className="text-[14px] font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Hero section
                  </p>
                  <Field label="Headline">
                    <input
                      value={branding.hero_headline}
                      onChange={(e) => update("hero_headline", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Subline">
                    <input
                      value={branding.hero_subline}
                      onChange={(e) => update("hero_subline", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="CTA button text">
                      <input
                        value={branding.hero_cta_text}
                        onChange={(e) =>
                          update("hero_cta_text", e.target.value)
                        }
                        className={inputCls}
                        style={inputStyle}
                      />
                    </Field>
                    <Field label="CTA link">
                      <input
                        value={branding.hero_cta_url}
                        onChange={(e) => update("hero_cta_url", e.target.value)}
                        className={inputCls}
                        style={inputStyle}
                      />
                    </Field>
                  </div>
                  <Field label="Hero layout">
                    <div className="flex gap-2">
                      {[
                        { value: "centered", label: "Centered" },
                        { value: "split", label: "Split" },
                        { value: "full-bleed", label: "Full bleed" },
                      ].map((opt) => {
                        const active = branding.hero_style === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => update("hero_style", opt.value)}
                            className="flex-1 py-2 rounded-lg border text-[12px] font-medium transition-all"
                            style={{
                              borderColor: active
                                ? "var(--color-accent)"
                                : "var(--color-border-md)",
                              background: active
                                ? "var(--color-accent-subtle)"
                                : "transparent",
                              color: active
                                ? "var(--color-accent-text)"
                                : "var(--color-text-secondary)",
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label="Banner image">
                    <UploadZone label="banner image" />
                  </Field>
                </div>
              )}

              {/* ── Announcement bar ── */}
              {activeSection === "announce" && (
                <div>
                  <p
                    className="text-[14px] font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Announcement bar
                  </p>
                  <div
                    className="flex items-center justify-between p-3 rounded-xl border mb-4"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div>
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Enable announcement bar
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        Shown at the top of every page
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        update(
                          "announcement_enabled",
                          !branding.announcement_enabled
                        )
                      }
                      className="relative rounded-full transition-colors duration-200"
                      style={{
                        width: 36,
                        height: 20,
                        background: branding.announcement_enabled
                          ? "var(--color-accent)"
                          : "var(--color-border-md)",
                      }}
                    >
                      <span
                        className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white transition-transform duration-200"
                        style={{
                          transform: branding.announcement_enabled
                            ? "translateX(19px)"
                            : "translateX(3px)",
                        }}
                      />
                    </button>
                  </div>
                  {branding.announcement_enabled && (
                    <>
                      <Field label="Announcement text">
                        <input
                          value={branding.announcement_text}
                          onChange={(e) =>
                            update("announcement_text", e.target.value)
                          }
                          className={inputCls}
                          style={inputStyle}
                        />
                      </Field>
                      <Field label="Bar background colour">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg border flex-shrink-0"
                            style={{
                              background: branding.announcement_bg,
                              borderColor: "var(--color-border-md)",
                            }}
                          />
                          <input
                            value={branding.announcement_bg}
                            onChange={(e) =>
                              update("announcement_bg", e.target.value)
                            }
                            placeholder="#0057ff"
                            className="flex-1 h-8 px-2.5 rounded-lg border text-[12px] font-mono outline-none focus:border-[var(--color-accent)] transition-colors"
                            style={{
                              borderColor: "var(--color-border-md)",
                              color: "var(--color-text-primary)",
                            }}
                          />
                        </div>
                      </Field>
                      {/* Live preview of bar */}
                      <div
                        className="rounded-lg py-2 px-4 text-center text-[11px] font-medium text-white"
                        style={{ background: branding.announcement_bg }}
                      >
                        {branding.announcement_text || "Your announcement text"}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Social ── */}
              {activeSection === "social" && (
                <div>
                  <p
                    className="text-[14px] font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Social links
                  </p>
                  <p
                    className="text-[13px] mb-4"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    These appear in your store footer. Leave blank to hide.
                  </p>
                  {[
                    {
                      key: "instagram",
                      label: "Instagram",
                      placeholder: "username",
                    },
                    {
                      key: "twitter",
                      label: "Twitter / X",
                      placeholder: "username",
                    },
                    {
                      key: "facebook",
                      label: "Facebook",
                      placeholder: "page name or URL",
                    },
                    { key: "tiktok", label: "TikTok", placeholder: "username" },
                  ].map((s) => (
                    <Field key={s.key} label={s.label}>
                      <div
                        className="flex items-center gap-0 rounded-lg border overflow-hidden"
                        style={{ borderColor: "var(--color-border-md)" }}
                      >
                        <span
                          className="px-3 py-2 text-[12px] border-r flex-shrink-0"
                          style={{
                            background: "var(--color-bg)",
                            borderColor: "var(--color-border-md)",
                            color: "var(--color-text-tertiary)",
                          }}
                        >
                          @
                        </span>
                        <input
                          value={branding.social[s.key] || ""}
                          onChange={(e) =>
                            updateNested("social", s.key, e.target.value)
                          }
                          placeholder={s.placeholder}
                          className="flex-1 h-9 px-3 text-[13px] outline-none transition-colors focus:border-[var(--color-accent)] border-0"
                          style={{
                            color: "var(--color-text-primary)",
                            background: "white",
                          }}
                        />
                      </div>
                    </Field>
                  ))}
                </div>
              )}

              {/* ── Footer ── */}
              {activeSection === "footer" && (
                <div>
                  <p
                    className="text-[14px] font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Footer
                  </p>
                  <Field label="Footer tagline">
                    <input
                      value={branding.footer_tagline}
                      onChange={(e) => update("footer_tagline", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                  <div>
                    <p
                      className="text-[12px] font-medium mb-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Footer links
                    </p>
                    <div className="space-y-2 mb-3">
                      {branding.footer_links.map((link, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={link.label}
                            onChange={(e) => {
                              const links = [...branding.footer_links];
                              links[i] = { ...links[i], label: e.target.value };
                              update("footer_links", links);
                            }}
                            placeholder="Label"
                            className="flex-1 h-8 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                            style={{
                              borderColor: "var(--color-border-md)",
                              color: "var(--color-text-primary)",
                            }}
                          />
                          <input
                            value={link.url}
                            onChange={(e) => {
                              const links = [...branding.footer_links];
                              links[i] = { ...links[i], url: e.target.value };
                              update("footer_links", links);
                            }}
                            placeholder="/url"
                            className="flex-1 h-8 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] font-mono transition-colors"
                            style={{
                              borderColor: "var(--color-border-md)",
                              color: "var(--color-text-primary)",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        update("footer_links", [
                          ...branding.footer_links,
                          { label: "", url: "" },
                        ])
                      }
                      className="text-[12px] font-medium"
                      style={{ color: "var(--color-accent)" }}
                    >
                      + Add link
                    </button>
                  </div>
                </div>
              )}

              {/* ── SEO ── */}
              {activeSection === "seo" && (
                <div>
                  <p
                    className="text-[14px] font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    SEO settings
                  </p>
                  <p
                    className="text-[13px] mb-4"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    These appear in search engine results and social link
                    previews.
                  </p>
                  <Field
                    label="Page title"
                    hint="Shown in browser tabs and search results. Aim for 50–60 characters."
                  >
                    <input
                      value={branding.seo_title}
                      onChange={(e) => update("seo_title", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                    <p
                      className="text-[10px] mt-1 text-right"
                      style={{
                        color:
                          branding.seo_title.length > 60
                            ? "var(--color-danger)"
                            : "var(--color-text-tertiary)",
                      }}
                    >
                      {branding.seo_title.length}/60
                    </p>
                  </Field>
                  <Field
                    label="Meta description"
                    hint="Shown in search results. Aim for 140–160 characters."
                  >
                    <textarea
                      value={branding.seo_description}
                      onChange={(e) =>
                        update("seo_description", e.target.value)
                      }
                      rows={3}
                      className={`${inputCls} resize-none py-2 h-auto`}
                      style={inputStyle}
                    />
                    <p
                      className="text-[10px] mt-1 text-right"
                      style={{
                        color:
                          branding.seo_description.length > 160
                            ? "var(--color-danger)"
                            : "var(--color-text-tertiary)",
                      }}
                    >
                      {branding.seo_description.length}/160
                    </p>
                  </Field>

                  {/* Google preview */}
                  <div
                    className="mt-4 rounded-xl border p-4"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-bg)",
                    }}
                  >
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      Search result preview
                    </p>
                    <p
                      className="text-[13px] font-medium mb-0.5"
                      style={{ color: "#1a0dab" }}
                    >
                      {branding.seo_title || branding.store_name}
                    </p>
                    <p className="text-[11px]" style={{ color: "#006621" }}>
                      {branding.domain}
                    </p>
                    <p
                      className="text-[12px] mt-1"
                      style={{ color: "#545454" }}
                    >
                      {branding.seo_description || branding.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Save footer */}
              <div
                className="flex items-center justify-between mt-6 pt-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <button
                  onClick={() => setBranding({ ...DEFAULT_BRANDING })}
                  className="flex items-center gap-1.5 text-[12px] font-medium"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <RefreshCw size={12} /> Reset to defaults
                </button>
                <Button onClick={handleSave} disabled={!dirty}>
                  <Save size={14} /> Save changes
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─── PREVIEW TAB ─── */}
      {tab === "preview" && (
        <div>
          {/* Device toggle */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <p
                className="text-[13px] font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Live preview — reflects your current settings
              </p>
            </div>
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

          {/* Preview frame */}
          <div
            className={`mx-auto transition-all duration-300 ${
              previewDevice === "mobile" ? "max-w-sm" : "max-w-full"
            }`}
          >
            <StorefrontPreview branding={branding} />
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
