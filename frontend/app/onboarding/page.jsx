"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Eye, Package, Check, ArrowRight, ChevronLeft, Loader2, X } from "lucide-react";
import { StepDetails } from "./StepDetails";
import { StepPreview } from "./StepPreview";
import { StepProduct } from "./StepProduct";
import { useCreateStore, useUploadStoreAssets, useCreateFirstProduct } from "@/lib/hooks/useOnboarding";
import { toast } from "@/lib/store/toastStore";
import { cn } from "@/lib/utils";

// ── Step config ───────────────────────────────────────────────
const STEPS = [
  {
    key:         "details",
    label:       "Your store",
    description: "Set up your store identity",
    Icon:        Store,
    color:       "#0057ff",
  },
  {
    key:         "preview",
    label:       "Preview",
    description: "See how buyers will find you",
    Icon:        Eye,
    color:       "#7c3aed",
  },
  {
    key:         "product",
    label:       "First product",
    description: "List something to sell",
    Icon:        Package,
    color:       "#059669",
  },
];

// ── Empty state shapes ────────────────────────────────────────
const EMPTY_DETAILS = { name: "", description: "", logoFile: null, bannerFile: null };
const EMPTY_PRODUCT = { name: "", price: "", stock: "1", description: "", images: [] };

// ── Progress bar at the top ───────────────────────────────────
function ProgressBar({ step, total }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className="h-1 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: STEPS[step]?.color ?? "#0057ff" }}
      />
    </div>
  );
}

// ── Step indicator pills ──────────────────────────────────────
function StepPills({ current }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        const Icon    = s.Icon;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300",
              done   ? "bg-green-100 text-green-700"                     : "",
              active ? "text-white shadow-sm"                             : "",
              !done && !active ? "bg-[var(--color-bg)] text-[var(--color-text-muted)]" : "",
            )} style={active ? { background: s.color } : {}}>
              {done
                ? <Check size={11} strokeWidth={3} />
                : <Icon size={11} />
              }
              <span className={cn("hidden sm:block", !active && !done && "hidden md:block")}>
                {done ? "Done" : s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-5 h-px" style={{ background: i < current ? "#16a34a40" : "var(--color-border-md)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Skip confirmation modal ───────────────────────────────────
function SkipModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-xl hover:bg-[var(--color-bg)]">
          <X size={15} style={{ color: "var(--color-text-muted)" }} />
        </button>
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-warning-bg)] flex items-center justify-center mb-4">
          <Package size={22} style={{ color: "var(--color-warning)" }} />
        </div>
        <h3 className="text-[16px] font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Skip adding a product?
        </h3>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--color-text-secondary)" }}>
          Your store is live! You can always add products later from your dashboard. Stores with products get 3× more views.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 h-10 rounded-xl border text-[13px] font-semibold transition-colors hover:bg-[var(--color-bg)]"
            style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)" }}>
            Add product
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-text-secondary)" }}>
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();

  const [step,         setStep]         = useState(0);
  const [detailsForm,  setDetailsForm]  = useState({ ...EMPTY_DETAILS });
  const [productForm,  setProductForm]  = useState({ ...EMPTY_PRODUCT });
  const [createdStore, setCreatedStore] = useState(null); // set after step 0 API call
  const [detailErrors, setDetailErrors] = useState({});
  const [skipModal,    setSkipModal]    = useState(false);
  const [exiting,      setExiting]      = useState(false);

  // Hooks
  const { create:  createStore,   loading: storelLoading, fieldErrors: storeErrors } = useCreateStore();
  const { upload:  uploadAssets,  loading: assetsLoading }  = useUploadStoreAssets();
  const { create:  createProduct, loading: productLoading } = useCreateFirstProduct();

  const anyLoading = storelLoading || assetsLoading || productLoading;

  // ── Validation ─────────────────────────────────────────────
  const validateDetails = () => {
    const errs = {};
    if (!detailsForm.name.trim())         errs.name = "Store name is required";
    if (detailsForm.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    setDetailErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const canAdvance = () => {
    if (step === 0) return detailsForm.name.trim().length >= 2;
    if (step === 2) return productForm.name.trim() && Number(productForm.price) > 0;
    return true;
  };

  // ── Step advance ───────────────────────────────────────────
  const handleNext = async () => {
    if (step === 0) {
      if (!validateDetails()) return;
      // Create the store
      const store = await createStore({
        name:        detailsForm.name.trim(),
        description: detailsForm.description.trim() || undefined,
      });
      if (!store) return; // error toast already shown

      // Upload logo/banner if provided
      let finalStore = store;
      if (detailsForm.logoFile || detailsForm.bannerFile) {
        const assets = await uploadAssets(store.id, {
          logoFile:   detailsForm.logoFile,
          bannerFile: detailsForm.bannerFile,
        });
        finalStore = {
          ...store,
          logo:   assets.logoUrl   ?? store.logo,
          banner: assets.bannerUrl ?? store.banner,
        };
      }

      setCreatedStore(finalStore);
      advanceTo(1);
      return;
    }

    if (step === 1) {
      advanceTo(2);
      return;
    }

    if (step === 2) {
      await handlePublish();
    }
  };

  const advanceTo = (next) => {
    setExiting(true);
    setTimeout(() => { setStep(next); setExiting(false); }, 220);
  };

  // ── Final publish ─────────────────────────────────────────
  const handlePublish = async () => {
    if (!createdStore?.id) return;
    const result = await createProduct(createdStore.id, {
      details: {
        name:        productForm.name.trim(),
        price:       Number(productForm.price),
        stock:       Number(productForm.stock || 1),
        description: productForm.description.trim() || undefined,
        is_active:   true,
      },
      imageFiles: productForm.images,
    });
    if (result) navigateToDashboard();
  };

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  // ── UI labels ──────────────────────────────────────────────
  const stepConfig = STEPS[step];

  const primaryLabel = () => {
    if (anyLoading) return <><Loader2 size={15} className="animate-spin" /> Working…</>;
    if (step === 0) return <>Create my store <ArrowRight size={15} /></>;
    if (step === 1) return <>Looks great — continue <ArrowRight size={15} /></>;
    if (step === 2) return <>Publish &amp; go to dashboard <ArrowRight size={15} /></>;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* Progress bar */}
          <ProgressBar step={step} total={STEPS.length} />

          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-accent)" }}>
                <Store size={14} className="text-white" />
              </div>
              <span className="text-[14px] font-bold hidden sm:block" style={{ color: "var(--color-text-primary)" }}>
                Corn Mart
              </span>
            </div>

            {/* Step pills */}
            <StepPills current={step} />

            {/* Exit */}
            {step < 2 ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="text-[12px] font-medium flex-shrink-0 hover:underline hidden sm:block"
                style={{ color: "var(--color-text-muted)" }}>
                Exit setup
              </button>
            ) : (
              <button
                onClick={() => setSkipModal(true)}
                className="text-[12px] font-medium flex-shrink-0 hover:underline"
                style={{ color: "var(--color-text-muted)" }}>
                Skip
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">

        {/* Step heading */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: stepConfig.color + "18" }}>
              <stepConfig.Icon size={18} style={{ color: stepConfig.color }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: stepConfig.color }}>
                Step {step + 1} of {STEPS.length}
              </p>
              <h1 className="text-[22px] md:text-[26px] font-bold leading-tight"
                style={{ color: "var(--color-text-primary)" }}>
                {step === 0 && "Set up your store"}
                {step === 1 && "Your storefront is ready"}
                {step === 2 && "Add your first product"}
              </h1>
            </div>
          </div>
          <p className="text-[14px] ml-12" style={{ color: "var(--color-text-secondary)" }}>
            {step === 0 && "Choose a name and style that reflects what you sell"}
            {step === 1 && "This is exactly how buyers will discover you on the marketplace"}
            {step === 2 && "One product is all you need to get your first sale"}
          </p>
        </div>

        {/* Step panel */}
        <div className={cn(
          "transition-all duration-220",
          exiting ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        )}>
          {step === 0 && (
            <StepDetails
              form={detailsForm}
              onChange={setDetailsForm}
              errors={{ ...detailErrors, ...storeErrors }}
            />
          )}
          {step === 1 && (
            <StepPreview store={createdStore} />
          )}
          {step === 2 && (
            <StepProduct form={productForm} onChange={setProductForm} />
          )}
        </div>
      </main>

      {/* ── Sticky bottom action bar ── */}
      <div className="sticky bottom-0 z-30 border-t border-[var(--color-border)] bg-white/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">

          {/* Back */}
          {step > 0 ? (
            <button
              onClick={() => advanceTo(step - 1)}
              disabled={anyLoading}
              className="flex items-center gap-2 h-10 px-4 rounded-xl border text-[13px] font-semibold transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
              style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)" }}>
              <ChevronLeft size={15} /> Back
            </button>
          ) : (
            <div /> // spacer
          )}

          {/* Step hint */}
          <p className="text-[12px] hidden md:block" style={{ color: "var(--color-text-muted)" }}>
            {step === 0 && "You can edit everything later from your dashboard"}
            {step === 1 && "Your storefront URL is already live"}
            {step === 2 && "You can add more products, variants and images from the products page"}
          </p>

          {/* Primary CTA */}
          <button
            onClick={handleNext}
            disabled={anyLoading || !canAdvance()}
            className="flex items-center gap-2 h-11 px-6 rounded-xl text-[14px] font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] shadow-sm"
            style={{ background: anyLoading || !canAdvance() ? "var(--color-text-muted)" : stepConfig.color }}>
            {primaryLabel()}
          </button>
        </div>
      </div>

      {/* Skip modal */}
      <SkipModal
        open={skipModal}
        onConfirm={navigateToDashboard}
        onCancel={() => setSkipModal(false)}
      />
    </div>
  );
}
