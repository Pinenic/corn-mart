import { CheckoutClient } from "./CheckoutClient";

const STEP_LABELS = {
  shipping: "Shipping",
  address: "Address",
  summary: "Summary",
};

export async function generateMetadata({ searchParams }) {
  const { step } = await searchParams;
  const stepLabel = STEP_LABELS[step] ?? "Shipping";
  return {
    title: `${stepLabel} — Checkout — Corn Mart Marketplace`,
  };
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}