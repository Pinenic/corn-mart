"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { ImageUploader } from "@/components/products/ImageUploader";
import { VariantsEditor } from "@/components/products/VariantsEditor";
import { OptionsEditor } from "@/components/products/OptionsEditor";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCreateProduct } from "@/lib/hooks/useProducts";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import useAuthStore from "@/lib/store/useAuthStore";

const STEPS = [
  { key: "details", label: "Details", desc: "Name, price, category" },
  // { key: "options",  label: "Options",  desc: "Size, colour, custom"        },
  // { key: "variants", label: "Variants", desc: "SKUs, stock, pricing"        },
  { key: "images", label: "Images", desc: "Photos and cover image" },
  { key: "review", label: "Review", desc: "Confirm and publish" },
];

const EMPTY = {
  name: "",
  description: "",
  price: "",
  brand: "",
  category: "",
  subcat_id: "",
  options: [],
  variants: [],
  images: [],
  is_active: true,
};

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...EMPTY });

  // Live hooks
  const { data: categoriesRaw } = useCategories();
  const { create, loading: creating, fieldErrors } = useCreateProduct();
  const { upload: uploadImages, loading: uploading } = useImageUpload();
  const storeId = useAuthStore((s) => s.storeId);

  const saving = creating || uploading;

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  // Subcategories derived from the selected category
  const selectedCat = (categoriesRaw ?? []).find(
    (c) => c.name === form.category
  );
  const subcats = selectedCat?.subcategories ?? [];

  const canAdvance = () => {
    if (step === 0) return form.name.trim() && form.price;
    return true;
  };

  // const handlePublish = async () => {
  //   const result = await create({
  //     name: form.name,
  //     description: form.description || undefined,
  //     price: Number(form.price),
  //     stock: Number(form.stock ?? 0),
  //     category: form.category || undefined,
  //     brand: form.brand || undefined,
  //     subcat_id: form.subcat_id ? Number(form.subcat_id) : undefined,
  //     is_active: form.is_active ?? true,
  //   });
  //   if (result) router.push("/dashboard/products");
  // };

  const handlePublish = async () => {
    // ── Step A: create the product record ──────────────────────
    const product = await create({
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      stock: Number(form.stock ?? 0),
      category: form.category || undefined,
      brand: form.brand || undefined,
      subcat_id: form.subcat_id ? Number(form.subcat_id) : undefined,
      is_active: form.is_active ?? true,
    });

    if (!product) return; // create() already showed the error toast

    // ── Step B: upload images if any were selected ─────────────
    const files = form.images.map((img) => img._file).filter(Boolean);

    if (files.length > 0 && storeId) {
      await uploadImages({
        file: files,
        variantId: product.variants[0].id,
        endpoint: `/stores/${storeId}/products/${product.id}/images`,
        field: "images",
        method: "POST",
      });
    }

    // ── Step C: navigate regardless of image outcome ───────────
    router.push("/dashboard/products");
  };

  const currentStep = STEPS[step];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/dashboard/products"
          className="flex items-center gap-1.5 text-[13px] font-medium hover:opacity-70 transition-opacity"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <ArrowLeft size={14} /> Products
        </Link>
        <span style={{ color: "var(--color-border-md)" }}>/</span>
        <span
          className="text-[13px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          New product
        </span>
      </div>

      {/* Step indicator */}
      <div
        className="flex items-center gap-0 mb-8 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <div key={s.key} className="flex items-center flex-shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all text-[11px] font-bold"
                  style={{
                    background: done
                      ? "var(--color-accent)"
                      : current
                      ? "var(--color-accent-subtle)"
                      : "white",
                    borderColor:
                      done || current
                        ? "var(--color-accent)"
                        : "var(--color-border-md)",
                    color: done
                      ? "white"
                      : current
                      ? "var(--color-accent)"
                      : "var(--color-text-tertiary)",
                  }}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className="text-[11px] font-medium whitespace-nowrap hidden sm:block"
                  style={{
                    color: current
                      ? "var(--color-text-primary)"
                      : "var(--color-text-tertiary)",
                  }}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className="w-8 h-px mx-1 flex-shrink-0"
                  style={{
                    background:
                      i < step
                        ? "var(--color-accent)"
                        : "var(--color-border-md)",
                    opacity: i < step ? 0.4 : 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <Card>
        <div className="mb-5">
          <h2
            className="text-[17px] font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {currentStep.label}
          </h2>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {currentStep.desc}
          </p>
        </div>

        {/* ── Step 0: Details ── */}
        {step === 0 && (
          <div className="space-y-4">
            <Field label="Product name *">
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Air Runner Pro"
                className={inputCls}
                style={inputStyle}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe what makes this product great…"
                rows={4}
                className={`${inputCls} resize-none py-2`}
                style={inputStyle}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Base price (ZMW) *">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>
              <Field label="Stock*">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  placeholder="00"
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>
              <Field label="Brand">
                <input
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  placeholder="Brand name"
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => {
                    update("category", e.target.value);
                    update("subcat_id", "");
                  }}
                  className={`${inputCls} cursor-pointer`}
                  style={inputStyle}
                >
                  <option value="">Select category</option>
                  {(categoriesRaw ?? []).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Subcategory">
                <select
                  value={form.subcat_id}
                  onChange={(e) => update("subcat_id", e.target.value)}
                  disabled={!form.category || !subcats.length}
                  className={`${inputCls} cursor-pointer disabled:opacity-50`}
                  style={inputStyle}
                >
                  <option value="">Select subcategory</option>
                  {subcats.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex-1">
                <p
                  className="text-[13px] font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Publish immediately
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Make this product visible on your storefront
                </p>
              </div>
              <button
                onClick={() => update("is_active", !form.is_active)}
                className="relative flex-shrink-0 rounded-full transition-colors duration-200"
                style={{
                  width: 36,
                  height: 20,
                  background: form.is_active
                    ? "var(--color-accent)"
                    : "var(--color-border-md)",
                }}
              >
                <span
                  className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white transition-transform duration-200"
                  style={{
                    transform: form.is_active
                      ? "translateX(3px)"
                      : "translateX(-15px)",
                  }}
                />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Options ── */}
        {/* {step === 1 && (
          <OptionsEditor
            options={form.options}
            onChange={(opts) => update("options", opts)}
          />
        )} */}

        {/* ── Step 2: Variants ── */}
        {/* {step === 2 && (
          <VariantsEditor
            variants={form.variants}
            productName={form.name}
            onChange={(v) => update("variants", v)}
          />
        )} */}

        {/* ── Step 3: Images ── */}
        {step === 1 && (
          <ImageUploader
            images={form.images}
            variants={form.variants}
            onChange={(imgs) => update("images", imgs)}
          />
        )}

        {/* ── Step 4: Review ── */}
        {step === 2 && (
          <div className="space-y-4">
            {[
              { label: "Product name", value: form.name || "—" },
              {
                label: "Price",
                value: form.price
                  ? `K${parseFloat(form.price).toFixed(2)}`
                  : "—",
              },
              { label: "Brand", value: form.brand || "—" },
              { label: "Category", value: form.category || "—" },
              // { label: "Options",       value: `${form.options.length} option type${form.options.length !== 1 ? "s" : ""}` },
              // { label: "Variants",      value: `${form.variants.length} variant${form.variants.length !== 1 ? "s" : ""}` },
              {
                label: "Images",
                value: `${form.images.length} image${
                  form.images.length !== 1 ? "s" : ""
                }`,
              },
              {
                label: "Status",
                value: form.is_active
                  ? "Will be published"
                  : "Draft (inactive)",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between py-2 border-b last:border-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span
                  className="text-[13px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {row.label}
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div
          className="flex items-center justify-between mt-6 pt-5 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Button
            variant="secondary"
            onClick={() =>
              step === 0 ? router.push("/products") : setStep((s) => s - 1)
            }
          >
            {step === 0 ? "Cancel" : "← Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
            >
              Continue <ChevronRight size={14} />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={saving}>
              {saving
                ? "Publishing…"
                : form.is_active
                ? "Publish product"
                : "Save as draft"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        className="text-[12px] font-medium block mb-1.5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </label>
      {children}
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

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { ArrowLeft, Check, ChevronRight } from "lucide-react";
// import { Button, Card } from "@/components/ui";
// import { ImageUploader } from "@/components/products/ImageUploader";
// import { VariantsEditor } from "@/components/products/VariantsEditor";
// import { OptionsEditor } from "@/components/products/OptionsEditor";
// import { CATEGORIES, SUBCATEGORIES } from "@/lib/products-data";

// const STEPS = [
//   { key: "details",  label: "Details",  desc: "Name, price, category"      },
//   { key: "options",  label: "Options",  desc: "Size, colour, custom"        },
//   { key: "variants", label: "Variants", desc: "SKUs, stock, pricing"        },
//   { key: "images",   label: "Images",   desc: "Photos and cover image"      },
//   { key: "review",   label: "Review",   desc: "Confirm and publish"         },
// ];

// const EMPTY = {
//   name: "", description: "", price: "", brand: "",
//   category: "", subcat_id: "",
//   options: [], variants: [], images: [],
//   is_active: true,
// };

// export default function NewProductPage() {
//   const router    = useRouter();
//   const [step, setStep]   = useState(0);
//   const [form, setForm]   = useState({ ...EMPTY });
//   const [saving, setSave] = useState(false);

//   const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));
//   const subcats = SUBCATEGORIES[form.category] || [];

//   const canAdvance = () => {
//     if (step === 0) return form.name.trim() && form.price;
//     return true;
//   };

//   const handlePublish = async () => {
//     setSave(true);
//     await new Promise((r) => setTimeout(r, 800)); // simulate API call
//     setSave(false);
//     router.push("/dashboard/products");
//   };

//   const currentStep = STEPS[step];

//   return (
//     <div className="max-w-2xl mx-auto">
//       {/* Back nav */}
//       <div className="flex items-center gap-3 mb-5">
//         <Link href="/dashboard/products"
//           className="flex items-center gap-1.5 text-[13px] font-medium hover:opacity-70 transition-opacity"
//           style={{ color: "var(--color-text-secondary)" }}>
//           <ArrowLeft size={14} /> Products
//         </Link>
//         <span style={{ color: "var(--color-border-md)" }}>/</span>
//         <span className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>New product</span>
//       </div>

//       {/* Step indicator */}
//       <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
//         {STEPS.map((s, i) => {
//           const done    = i < step;
//           const current = i === step;
//           return (
//             <div key={s.key} className="flex items-center flex-shrink-0">
//               <button
//                 onClick={() => i < step && setStep(i)}
//                 disabled={i > step}
//                 className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 <div className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all text-[11px] font-bold"
//                   style={{
//                     background:  done ? "var(--color-accent)" : current ? "var(--color-accent-subtle)" : "white",
//                     borderColor: done || current ? "var(--color-accent)" : "var(--color-border-md)",
//                     color:       done ? "white" : current ? "var(--color-accent)" : "var(--color-text-tertiary)",
//                   }}>
//                   {done ? <Check size={12} strokeWidth={3} /> : i + 1}
//                 </div>
//                 <span className="text-[11px] font-medium whitespace-nowrap hidden sm:block"
//                   style={{ color: current ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
//                   {s.label}
//                 </span>
//               </button>
//               {i < STEPS.length - 1 && (
//                 <div className="w-8 h-px mx-1 flex-shrink-0"
//                   style={{ background: i < step ? "var(--color-accent)" : "var(--color-border-md)", opacity: i < step ? 0.4 : 1 }} />
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Step content */}
//       <Card>
//         <div className="mb-5">
//           <h2 className="text-[17px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
//             {currentStep.label}
//           </h2>
//           <p className="text-[13px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
//             {currentStep.desc}
//           </p>
//         </div>

//         {/* ── Step 0: Details ── */}
//         {step === 0 && (
//           <div className="space-y-4">
//             <Field label="Product name *">
//               <input value={form.name} onChange={(e) => update("name", e.target.value)}
//                 placeholder="e.g. Air Runner Pro"
//                 className={inputCls} style={inputStyle} />
//             </Field>
//             <Field label="Description">
//               <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
//                 placeholder="Describe what makes this product great…"
//                 rows={4} className={`${inputCls} resize-none py-2`} style={inputStyle} />
//             </Field>
//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Base price ($) *">
//                 <input type="number" step="0.01" min="0"
//                   value={form.price} onChange={(e) => update("price", e.target.value)}
//                   placeholder="0.00" className={inputCls} style={inputStyle} />
//               </Field>
//               <Field label="Brand">
//                 <input value={form.brand} onChange={(e) => update("brand", e.target.value)}
//                   placeholder="Brand name" className={inputCls} style={inputStyle} />
//               </Field>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Category">
//                 <select value={form.category} onChange={(e) => { update("category", e.target.value); update("subcat_id", ""); }}
//                   className={`${inputCls} cursor-pointer`} style={inputStyle}>
//                   <option value="">Select category</option>
//                   {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
//                 </select>
//               </Field>
//               <Field label="Subcategory">
//                 <select value={form.subcat_id} onChange={(e) => update("subcat_id", e.target.value)}
//                   disabled={!form.category || !subcats.length}
//                   className={`${inputCls} cursor-pointer disabled:opacity-50`} style={inputStyle}>
//                   <option value="">Select subcategory</option>
//                   {subcats.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
//                 </select>
//               </Field>
//             </div>
//             <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: "var(--color-border)" }}>
//               <div className="flex-1">
//                 <p className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>Publish immediately</p>
//                 <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>Make this product visible on your storefront</p>
//               </div>
//               <button onClick={() => update("is_active", !form.is_active)}
//                 className="relative flex-shrink-0 rounded-full transition-colors duration-200"
//                 style={{ width: 36, height: 20, background: form.is_active ? "var(--color-accent)" : "var(--color-border-md)" }}>
//                 <span className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white transition-transform duration-200"
//                   style={{ transform: form.is_active ? "translateX(19px)" : "translateX(3px)" }} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ── Step 1: Options ── */}
//         {step === 1 && (
//           <OptionsEditor
//             options={form.options}
//             onChange={(opts) => update("options", opts)}
//           />
//         )}

//         {/* ── Step 2: Variants ── */}
//         {step === 2 && (
//           <VariantsEditor
//             variants={form.variants}
//             productName={form.name}
//             onChange={(v) => update("variants", v)}
//           />
//         )}

//         {/* ── Step 3: Images ── */}
//         {step === 3 && (
//           <ImageUploader
//             images={form.images}
//             variants={form.variants}
//             onChange={(imgs) => update("images", imgs)}
//           />
//         )}

//         {/* ── Step 4: Review ── */}
//         {step === 4 && (
//           <div className="space-y-4">
//             {[
//               { label: "Product name",  value: form.name      || "—" },
//               { label: "Price",         value: form.price ? `$${parseFloat(form.price).toFixed(2)}` : "—" },
//               { label: "Brand",         value: form.brand     || "—" },
//               { label: "Category",      value: form.category  || "—" },
//               { label: "Options",       value: `${form.options.length} option type${form.options.length !== 1 ? "s" : ""}` },
//               { label: "Variants",      value: `${form.variants.length} variant${form.variants.length !== 1 ? "s" : ""}` },
//               { label: "Images",        value: `${form.images.length} image${form.images.length !== 1 ? "s" : ""}` },
//               { label: "Status",        value: form.is_active ? "Will be published" : "Draft (inactive)" },
//             ].map((row) => (
//               <div key={row.label} className="flex justify-between py-2 border-b last:border-0"
//                 style={{ borderColor: "var(--color-border)" }}>
//                 <span className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{row.label}</span>
//                 <span className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>{row.value}</span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Navigation */}
//         <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: "var(--color-border)" }}>
//           <Button variant="secondary" onClick={() => step === 0 ? router.push("/dashboard/products") : setStep((s) => s - 1)}>
//             {step === 0 ? "Cancel" : "← Back"}
//           </Button>
//           {step < STEPS.length - 1 ? (
//             <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
//               Continue <ChevronRight size={14} />
//             </Button>
//           ) : (
//             <Button onClick={handlePublish} disabled={saving}>
//               {saving ? "Publishing…" : form.is_active ? "Publish product" : "Save as draft"}
//             </Button>
//           )}
//         </div>
//       </Card>
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <div>
//       <label className="text-[12px] font-medium block mb-1.5" style={{ color: "var(--color-text-secondary)" }}>{label}</label>
//       {children}
//     </div>
//   );
// }

// const inputCls = "w-full h-9 px-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]";
// const inputStyle = { borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" };
