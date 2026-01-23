export const metadata = {
  title: 'Shopping Cart | Corn Mart',
  description: 'Review your shopping cart and proceed to checkout.',
};

import CartClient from './CartClient';

export default function Page() {
  // Cart is client-specific (stored in client store/localStorage). Render a lightweight
  // server-side page (SEO-friendly skeleton) and mount the client component which reads
  // the client's cart store and provides interactivity.
  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      <CartClient />
    </div>
  );
}
