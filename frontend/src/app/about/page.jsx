export const metadata = {
  title: 'About Corn Mart',
  description: 'What Corn Mart is and who it helps — a friendly overview for visitors and users.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl py-16 px-6">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold leading-tight mb-4">Welcome to Corn Mart</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Corn Mart is a simple, modern online marketplace where small businesses and individual
          sellers can list products and connect directly with buyers. We make it easy to sell
          locally, manage orders, and get paid — all from one place.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">What you can do here</h2>
        <ul className="space-y-3 text-gray-700">
          <li>
            <strong>Discover products</strong> — Browse stores and find items from local sellers.
          </li>
          <li>
            <strong>Open a store</strong> — Quick onboarding for sellers to create a storefront and
            start listing products.
          </li>
          <li>
            <strong>Simple checkout</strong> — Easy cart and checkout flows so buyers can complete
            purchases without friction.
          </li>
          <li>
            <strong>Order management</strong> — Sellers can receive orders, update statuses, and
            communicate with customers when needed.
          </li>
          <li>
            <strong>Payouts</strong> — Sellers can request and receive payouts for completed sales.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Who it helps</h2>
        <p className="text-gray-700 mb-3">
          Corn Mart is built for local entrepreneurs, makers, and small retailers who want a
          straightforward way to reach customers online without the complexity of larger
          platforms. It’s also great for buyers who prefer supporting local businesses and want a
          clear, trustworthy buying experience.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Our approach</h2>
        <p className="text-gray-700 mb-3">
          We focus on simplicity and transparency: clear product listings, straightforward order
          updates, and reliable payment flows. Communication between buyers and sellers is kept
          direct so issues can be resolved quickly.
        </p>

        <p className="text-gray-700">
          If you’re a seller, start by creating your store and adding a few products to see how the
          platform works. If you’re a buyer, browse stores and use the cart to place your first
          order — it’s that easy.
        </p>
      </section>

      <footer className="mt-12 text-sm text-gray-500">
        <p>
          Questions or feedback? Reach out through the project repository or the contact options on
          the site — we’d love to hear how Corn Mart can better serve your community.
        </p>
      </footer>
    </main>
  )
}
//         - Start with <code>frontend/src/app/</code> for UI routes and <code>backend/</code> for API
//         patterns. See <code>.github/copilot-instructions.md</code> (if present) for repo-specific
//         notes about local development and conventions.
//       </p>

//       <p className="text-sm text-gray-600">Generated: a concise project overview to help new contributors find their way.</p>
//     </main>
//   )
// }
