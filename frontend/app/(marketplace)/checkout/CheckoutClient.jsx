"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Truck,
  MapPin,
  ClipboardCheck,
  ArrowRight,
  LogIn,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui";
import { formatPrice, truncate, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import useAuthStore from "@/lib/store/useAuthStore";
import { usePlaceOrder } from "@/lib/hooks/useBuyerOrders";
import { useDeliveryEligibility } from "@/lib/hooks/useDeliveryEligibility";
import { toast } from "@/lib/store/toastStore";

const ZAMBIA_PHONE_REGEX = /^(\+260|0)(7|9|5)\d{8}$/;
const STEPS = ["shipping", "address", "summary"];

const STEP_META = {
  shipping: { label: "Shipping", Icon: Truck },
  address: { label: "Address", Icon: MapPin },
  summary: { label: "Summary", Icon: ClipboardCheck },
};

function StepIndicator({ step }) {
  const activeIndex = STEPS.indexOf(step);
  return (
    <div className="flex items-center gap-6 md:gap-10 mb-10">
      {STEPS.map((s, i) => {
        const { label, Icon } = STEP_META[s];
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        return (
          <div key={s} className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                isActive || isDone
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg)] text-[var(--color-text-muted)]"
              )}
            >
              <Icon size={16} />
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] leading-none">
                Step {i + 1}
              </p>
              <p
                className={cn(
                  "text-[14px] font-semibold leading-tight",
                  isActive
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]"
                )}
              >
                {label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = STEPS.includes(searchParams.get("step")) ? searchParams.get("step") : "shipping";

  const goToStep = (s) => router.push(`/checkout?step=${s}`);

  const cartId = useCartStore((s) => s.cartId);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const _subtotal = useCartStore((s) => s.subtotal);
  const _byStore = useCartStore((s) => s.byStore);
  const subtotal = _subtotal();
  const byStore = _byStore();

  const { user } = useAuthStore();
  const isGuest = !user;

  const { place, loading } = usePlaceOrder();

  const storeIds = Object.keys(byStore);
  const { allDeliverable, totalDeliveryFee, loading: eligibilityLoading } =
    useDeliveryEligibility(storeIds);

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });
  const [errors, setErrors] = useState({});
  const [delivery, setDelivery] = useState(false);

  useEffect(() => {
    if (delivery && !eligibilityLoading && !allDeliverable) {
      setDelivery(false);
    }
  }, [delivery, eligibilityLoading, allDeliverable]);

  const deliveryFee = delivery ? totalDeliveryFee : 0;
  const total = subtotal + deliveryFee;

  const validateAddress = () => {
    const newErrors = {};
    if (!shipping.name.trim()) newErrors.name = "Name is required";
    if (!shipping.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!ZAMBIA_PHONE_REGEX.test(shipping.phone)) {
      newErrors.phone = "Enter a valid number";
    }
    if (delivery) {
      if (!shipping.address.trim()) newErrors.address = "Address is required";
      if (!shipping.city.trim()) newErrors.city = "City is required";
      if (!shipping.country.trim()) newErrors.country = "Country is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === "shipping") {
      goToStep("address");
      return;
    }
    if (step === "address") {
      if (!validateAddress()) return;
      goToStep("summary");
      return;
    }
  };

  const handleBack = () => {
    if (step === "address") goToStep("shipping");
    if (step === "summary") goToStep("address");
  };

  const handlePlaceOrder = async () => {
    const result = await place({
      cart_id: cartId,
      shipping_info: shipping,
      fulfillment_method: delivery ? "platform_delivery" : "self_arranged",
    });

    if (result) {
      await clearCart();
      toast.success("Order placed — the seller will contact you shortly");
      router.push("/orders");
    }
  };

  // Guests can't check out — full-page prompt instead of the stepper
  if (isGuest) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <LogIn size={40} className="text-[var(--color-text-muted)] mx-auto mb-4" />
        <h1 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-2">
          Sign in to check out
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
          Your cart is saved locally — sign in or create an account to place your order.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/sign-in">
            <button className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">
              Sign in
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="h-11 px-6 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[var(--color-text-secondary)] text-[13px] font-semibold hover:bg-[var(--color-bg)] transition-colors">
              Create account
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShoppingBag size={40} className="text-[var(--color-text-muted)] mx-auto mb-4" />
        <h1 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-2">
          Your cart is empty
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
          Add something to your cart before checking out.
        </p>
        <Link href="/marketplace/products">
          <button className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">
            Browse Products
          </button>
        </Link>
      </div>
    );
  }

  const nextDisabled =
    step === "address" &&
    (!shipping.name.trim() ||
      !ZAMBIA_PHONE_REGEX.test(shipping.phone) ||
      (delivery &&
        (!shipping.address.trim() || !shipping.city.trim() || !shipping.country.trim())));

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
      <StepIndicator step={step} />

      {/* Step: Shipping method */}
      {step === "shipping" && (
        <div className="space-y-4">
          <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-1">
            Shipment Method
          </h2>
          {[
            { label: "Delivery", value: true, hint: "Delivered to your address" },
            { label: "Self pick", value: false, hint: "Arrange pickup with the seller" },
          ].map(({ label, value, hint }) => {
            const disabled = value === true && !allDeliverable;
            const selected = delivery === value;
            return (
              <button
                key={label}
                disabled={disabled}
                onClick={() => setDelivery(value)}
                className={cn(
                  "w-full flex items-center justify-between gap-4 p-4 rounded-[var(--radius)] border text-left transition-colors",
                  disabled
                    ? "border-[var(--color-border)] opacity-50 cursor-not-allowed"
                    : selected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                    : "border-[var(--color-border-md)] hover:border-[var(--color-primary)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      selected ? "border-[var(--color-primary)]" : "border-[var(--color-border-md)]"
                    )}
                  >
                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{label}</p>
                    <p className="text-[12px] text-[var(--color-text-secondary)]">{hint}</p>
                  </div>
                </div>
                {value === true && totalDeliveryFee > 0 && (
                  <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                    {formatPrice(totalDeliveryFee)}
                  </span>
                )}
              </button>
            );
          })}
          {!eligibilityLoading && !allDeliverable && storeIds.length > 0 && (
            <p className="text-[12px] text-[var(--color-text-muted)]">
              Delivery isn&apos;t available for every seller in your cart yet — you can still arrange
              pickup directly with them.
            </p>
          )}
        </div>
      )}

      {/* Step: Address */}
      {step === "address" && (
        <div className="space-y-4">
          <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-1">
            {delivery ? "Delivery Address" : "Contact Details"}
          </h2>
          {[
            { label: "Full name", field: "name", placeholder: "Your name" },
            { label: "Phone", field: "phone", placeholder: "+260 900 0000" },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-1.5">
                {label} *
              </label>
              <input
                value={shipping[field]}
                onChange={(e) => setShipping((s) => ({ ...s, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full h-11 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] bg-white text-[13px] outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
              />
              {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
            </div>
          ))}

          {delivery && (
            <>
              {[
                { label: "Address", field: "address", placeholder: "Street address" },
                { label: "City", field: "city", placeholder: "City" },
                { label: "Country", field: "country", placeholder: "Country" },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-1.5">
                    {label} *
                  </label>
                  <input
                    value={shipping[field]}
                    onChange={(e) => setShipping((s) => ({ ...s, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full h-11 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] bg-white text-[13px] outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
                  />
                  {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Step: Summary */}
      {step === "summary" && (
        <div className="space-y-5">
          <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-1">
            Summary
          </h2>

          <div className="bg-[var(--color-bg)] rounded-[var(--radius)] p-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              {delivery ? "Delivering to" : "Contact"}
            </p>
            {Object.entries(shipping)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between text-[13px]">
                  <span className="capitalize text-[var(--color-text-muted)]">{k}</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{v}</span>
                </div>
              ))}
          </div>

          <div className="bg-[var(--color-bg)] rounded-[var(--radius)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
            {items.map((i) => (
              <div key={i.key} className="flex justify-between text-[13px] py-1">
                <span className="text-[var(--color-text-secondary)] truncate flex-1 mr-3">
                  {truncate(i.name, 32)} ×{i.quantity}
                </span>
                <span className="font-semibold text-[var(--color-text-primary)] flex-shrink-0">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-[13px] py-1.5 border-t border-[var(--color-border)] mt-2 pt-2">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {formatPrice(subtotal)}
              </span>
            </div>
            {delivery && (
              <div className="flex justify-between text-[13px] py-1">
                <span className="text-[var(--color-text-secondary)]">Delivery fee</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {deliveryFee > 0 ? formatPrice(deliveryFee) : "Free"}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[15px] py-1.5 border-t border-[var(--color-border)] mt-2 pt-2">
              <span className="font-bold text-[var(--color-text-primary)]">Total</span>
              <span className="font-bold text-[var(--color-text-primary)]">{formatPrice(total)}</span>
            </div>
          </div>

          <p className="text-[12px] text-[var(--color-text-muted)] text-center leading-relaxed px-2">
            💬 Payment isn&apos;t collected here — the seller will contact you directly to arrange
            and confirm payment for this order.
          </p>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex items-center gap-3 mt-10">
        {step !== "shipping" && (
          <button
            onClick={handleBack}
            className="h-11 px-6 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors"
          >
            Back
          </button>
        )}
        {step === "summary" ? (
          <Button size="lg" className="flex-1" loading={loading} onClick={handlePlaceOrder}>
            Place Order
          </Button>
        ) : (
          <button
            onClick={handleNext}
            disabled={nextDisabled}
            className="flex-1 h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export function CheckoutClient() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
