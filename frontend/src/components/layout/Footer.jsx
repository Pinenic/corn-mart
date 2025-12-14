import { Mail, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-green-950 text-gray-200 py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand info */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Corn Mart</h3>
          <p className="text-sm text-gray-400">
            Your all-in-one marketplace for trendy, affordable, and quality products.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-white">Quick Links</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="#" className="hover:text-primary transition">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-white">Customer Service</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="#" className="hover:text-primary transition">
                Track Order
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Shipping Info
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Support
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-white">Stay Updated</h4>
          <p className="text-sm text-gray-400 mb-3">
            Subscribe for exclusive offers and updates.
          </p>
          <form className="flex flex-col lg:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-2 rounded-md w-full sm:w-auto flex-1 text-green-50 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/70 text-white px-4 py-2 rounded-md font-medium transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 px-6">
        <p>© {new Date().getFullYear()} Pineapple inc. All rights reserved.</p>
        <div className="flex gap-4 mt-3 md:mt-0">
          <a href="#" className="hover:text-primary transition">
            <Facebook size={18} />
          </a>
          <a href="#" className="hover:text-primary transition">
            <Instagram size={18} />
          </a>
          <a href="#" className="hover:text-primary transition">
            <Twitter size={18} />
          </a>
          <a href="mailto:contact@xoostore.com" className="hover:text-primary transition">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
