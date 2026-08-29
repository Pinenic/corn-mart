"use client";
import { useEffect, useRef, useState } from "react";
import {
  Save,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  Trash2,
} from "lucide-react";
import { PageHeader, Card, Button, Badge } from "@/components/ui";
import { useApi } from "@/lib/hooks/useApi";
import useAuthStore from "@/lib/store/useAuthStore";
import {
  useStoreLogoUpload,
  useStoreBannerUpload,
} from "@/lib/hooks/useImageUpload";
import { storeService } from "@/lib/api/services";
import { toast } from "@/lib/store/toastStore";
import {
  parseStoreConfigForEditing,
  getBlockOrDefault,
  buildConfigForSave,
} from "@/lib/storefront/configSchema";
import { cn } from "@/lib/utils";

// ── Small local toggle switch — kept local rather than pulling in the
// shadcn/radix Switch elsewhere in the repo, so this stays on the same
// --color-primary tokens as the rest of the marketplace/dashboard work
// instead of a separate --primary/--input token set. ──────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors flex-shrink-0",
        checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-md)]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}

// ── Logo/Banner upload row ──────────────────────────────────────────
function ImageUploadRow({
  label,
  hint,
  currentUrl,
  uploading,
  onUpload,
  onRemove,
  wide,
}) {
  const inputRef = useRef(null);
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[var(--color-border)] last:border-0">
      <div
        className={cn(
          "flex-shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-bg)] overflow-hidden flex items-center justify-center",
          wide ? "w-28 h-16" : "w-16 h-16"
        )}
      >
        {currentUrl ? (
          <img src={currentUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={18} className="text-[var(--color-text-muted)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
          {label}
        </p>
        <p className="text-[12px] text-[var(--color-text-muted)]">{hint}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={13} />{" "}
          {uploading ? "Uploading…" : currentUrl ? "Replace" : "Upload"}
        </Button>
        {currentUrl && (
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function StorefrontEditorPage() {
  const storeId = useAuthStore((s) => s.storeId);
  const { data: store, isLoading, mutate } = useApi("/stores/mine");
  let storeData = store?.[0];

  const logoUpload = useStoreLogoUpload(storeId);
  const bannerUpload = useStoreBannerUpload(storeId);

  const [hero, setHero] = useState(null);
  const [tabs, setTabs] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({ hero: null, productTabs: null });

  // Initialize the draft from store.config exactly once per store load —
  // not on every render — so a background SWR revalidation (e.g. after
  // a logo upload calls mutate()) never clobbers in-progress hero/tab edits.
  const initialized = useRef(false);
  useEffect(() => {
    console.log(store);
    if (storeData && !initialized.current) {
      const blocks = parseStoreConfigForEditing(storeData.config);
      setHero(getBlockOrDefault(blocks, "hero"));
      setTabs(getBlockOrDefault(blocks, "productTabs"));
      initialized.current = true;
    }
  }, [store]);

  const updateHero = (patch) => {
    setHero((h) => ({ ...h, ...patch }));
    setDirty(true);
  };
  const updateHeroCta = (patch) => {
    setHero((h) => ({ ...h, cta: { ...h.cta, ...patch } }));
    setDirty(true);
  };
  const updateTabsBlock = (patch) => {
    setTabs((t) => ({ ...t, ...patch }));
    setDirty(true);
  };
  const updateTab = (index, patch) => {
    setTabs((t) => ({
      ...t,
      tabs: t.tabs.map((tab, i) => (i === index ? { ...tab, ...patch } : tab)),
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    const result = buildConfigForSave({ hero, productTabs: tabs });
    setErrors(result.errors);
    if (!result.valid) {
      toast.error("Fix the highlighted fields before saving");
      return;
    }
    setSaving(true);
    try {
      await storeService.update(storeId, { config: result.config });
      toast.success("Storefront updated");
      setDirty(false);
    } catch (err) {
      toast.error("Couldn't save changes — try again");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !hero || !tabs) {
    return (
      <div className="max-w-3xl">
        <PageHeader
          title="Storefront"
          description="Customize your public storefront page"
        />
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-[var(--color-bg)] rounded-[var(--radius)]" />
          <div className="h-40 bg-[var(--color-bg)] rounded-[var(--radius)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Storefront"
        description="Customize your public storefront page"
        action={
          <div className="flex items-center gap-2">
            {store[0]?.id && (
              <a
                href={`/marketplace/stores/${store[0].id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm">
                  <ExternalLink size={13} /> View storefront
                </Button>
              </a>
            )}
            <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
              <Save size={13} />{" "}
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </Button>
          </div>
        }
      />

      {/* Logo & Banner — uploads immediately, separate from the config save below */}
      <Card className="mb-6" noPadding>
        <div className="p-4 md:p-5 pb-0">
          <h2 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">
            Logo & Banner
          </h2>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Your banner also doubles as the hero image on your storefront page
            below.
          </p>
        </div>
        <div className="px-4 md:px-5">
          <ImageUploadRow
            label="Logo"
            hint="Square image, shown next to your store name"
            currentUrl={store[0]?.logo}
            uploading={logoUpload.uploading}
            onUpload={(file) =>
              logoUpload.uploadLogo(file, { onSuccess: () => mutate() })
            }
            onRemove={() =>
              logoUpload.removeLogo({ onSuccess: () => mutate() })
            }
          />
          <ImageUploadRow
            label="Banner"
            hint="Wide image — also used as your hero section image"
            currentUrl={store[0]?.banner}
            uploading={bannerUpload.uploading}
            onUpload={(file) =>
              bannerUpload.uploadBanner(file, { onSuccess: () => mutate() })
            }
            onRemove={() =>
              bannerUpload.removeBanner({ onSuccess: () => mutate() })
            }
            wide
          />
        </div>
      </Card>

      {/* Hero */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">
            Hero Section
          </h2>
          <Toggle
            checked={hero.enabled}
            onChange={(v) => updateHero({ enabled: v })}
          />
        </div>

        <div
          className={cn(
            "space-y-4",
            !hero.enabled && "opacity-40 pointer-events-none"
          )}
        >
          <div>
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-1.5">
              Eyebrow text
            </label>
            <input
              value={hero.eyebrow ?? ""}
              onChange={(e) => updateHero({ eyebrow: e.target.value })}
              placeholder="Pro. Beyond."
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-1.5">
              Headline <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              value={hero.headline}
              onChange={(e) => updateHero({ headline: e.target.value })}
              placeholder="Welcome to our store"
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)]"
            />
            {errors.hero?.fieldErrors?.headline && (
              <p className="text-[12px] text-[var(--color-danger)] mt-1">
                {errors.hero.fieldErrors.headline[0]}
              </p>
            )}
          </div>

          <div>
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-1.5">
              Subheading
            </label>
            <textarea
              value={hero.subhead ?? ""}
              onChange={(e) => updateHero({ subhead: e.target.value })}
              placeholder="Browse our latest products below."
              rows={2}
              className="w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-1.5">
                Button label
              </label>
              <input
                value={hero.cta?.label ?? ""}
                onChange={(e) => updateHeroCta({ label: e.target.value })}
                placeholder="Shop Now"
                className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-1.5">
                Button link
              </label>
              <input
                value={hero.cta?.href ?? ""}
                onChange={(e) => updateHeroCta({ href: e.target.value })}
                placeholder="Defaults to your store page"
                className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
          {errors.hero?.fieldErrors?.cta && (
            <p className="text-[12px] text-[var(--color-danger)]">
              Enter a full link starting with https://, or leave it blank.
            </p>
          )}

          <div>
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-2">
              Theme
            </label>
            <div className="flex gap-2">
              {["dark", "light"].map((t) => (
                <button
                  key={t}
                  onClick={() => updateHero({ theme: t })}
                  className={cn(
                    "flex-1 h-10 rounded-[var(--radius-sm)] border text-[13px] font-medium capitalize transition-colors",
                    hero.theme === t
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-text)]"
                      : "border-[var(--color-border-md)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Product Tabs */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">
            Product Tabs
          </h2>
          <Toggle
            checked={tabs.enabled}
            onChange={(v) => updateTabsBlock({ enabled: v })}
          />
        </div>

        <div
          className={cn(
            "space-y-3",
            !tabs.enabled && "opacity-40 pointer-events-none"
          )}
        >
          {tabs.tabs.map((tab, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                value={tab.label}
                onChange={(e) => updateTab(i, { label: e.target.value })}
                className="flex-1 h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)]"
              />
              {/* Only "newest" has real data behind it right now — see
                  lib/storefront/configSchema.js SUPPORTED_TAB_SOURCES.
                  Locked rather than hidden, so it's clear more sources
                  are coming rather than looking broken/missing. */}
              <select
                value={tab.source}
                disabled
                className="h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] bg-[var(--color-bg)] text-[var(--color-text-secondary)] cursor-not-allowed"
              >
                <option value="newest">New Arrival</option>
              </select>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Badge variant="default">Bestseller — coming soon</Badge>
            <Badge variant="default">Featured — coming soon</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
