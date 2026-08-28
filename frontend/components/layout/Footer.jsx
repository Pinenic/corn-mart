"use client";
import Link from "next/link";
import { ShoppingCart, Mail, MapPin, Phone } from "lucide-react";

const SHOP_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/marketplace/stores", label: "Stores" },
  { href: "/marketplace/products", label: "All Products" },
  { href: "/orders", label: "My Orders" },
];

const COMPANY_LINKS = [
  { href: "/onboarding", label: "Start Selling" },
  { href: "#", label: "About Us" },
//   { href: "/help", label: "Help Center" },
//   { href: "/contact", label: "Contact Us" },
];

const LEGAL_LINKS = [
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Returns & Refunds" },
];

// Brand icons not available in lucide-react
function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 5.82c-.9-.88-1.4-2.08-1.4-3.32h-3.1v13.4a2.62 2.62 0 1 1-1.86-2.5V10.3a5.72 5.72 0 1 0 4.96 5.68V9.4a6.7 6.7 0 0 0 3.9 1.25V7.55a3.9 3.9 0 0 1-2.5-1.73Z" />
    </svg>
  );
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.01 2C6.49 2 2.02 6.47 2.02 12c0 1.87.51 3.63 1.4 5.13L2 22l5.02-1.38A9.94 9.94 0 0 0 12.01 22C17.53 22 22 17.53 22 12S17.53 2 12.01 2Zm5.6 14.15c-.24.67-1.38 1.28-1.92 1.36-.49.08-1.11.11-1.79-.11-.41-.13-.94-.31-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.55-1.16-2.95 0-1.41.73-2.1.99-2.39.26-.28.57-.35.76-.35.19 0 .38 0 .54.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.28.36-.23.6-.14.24.09 1.55.73 1.81.86.26.14.44.2.5.31.07.12.07.65-.17 1.32Z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 22v-8.4h2.82l.42-3.28h-3.24V8.2c0-.95.26-1.6 1.63-1.6h1.74V3.68C16.56 3.6 15.6 3.5 14.47 3.5c-2.34 0-3.94 1.43-3.94 4.05v2.77H7.7v3.28h2.83V22h2.97Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/profile.php?id=61591866114652",
    label: "Facebook",
    Icon: FacebookIcon,
  },
  {
    href: "https://vm.tiktok.com/ZS9hM6cBoDCEh-cMaxP/",
    label: "TikTok",
    Icon: TikTokIcon,
  },
  {
    href: "https://wa.me/260764412659",
    label: "WhatsApp",
    Icon: WhatsAppIcon,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-primary)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo + description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
                <ShoppingCart size={16} className="text-[var(--color-primary)]" />
              </div>
              <span className="text-[16px] font-bold text-white lowercase">
                corn mart
              </span>
            </Link>
            <p className="text-[13px] text-white/60 leading-relaxed max-w-xs mb-5">
              A local marketplace connecting buyers with trusted stores.
              Discover products, support sellers, and shop with confidence.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-[#0a0a0a] hover:bg-white/80 transition-colors"
                >
                  <Icon size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-[13px] font-semibold text-white mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-[13px] font-semibold text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / legal */}
          <div>
            <h3 className="text-[13px] font-semibold text-white mb-4">
              Contact
            </h3>
            <ul className="space-y-2.5 mb-5">
              <li className="flex items-start gap-2 text-[13px] text-white/60">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                Kitwe, Zambia
              </li>
              <li className="flex items-start gap-2 text-[13px] text-white/60">
                <Phone size={14} className="mt-0.5 flex-shrink-0" />
                +260 764412659
              </li>
              <li className="flex items-start gap-2 text-[13px] text-white/60">
                <Mail size={14} className="mt-0.5 flex-shrink-0" />
                cornmart33@gmail.com
              </li>
            </ul>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[12px] text-white/40">
            &copy; {year} Corn Mart. All rights reserved.
          </p>
          {/* <p className="text-[12px] text-white/40">
            Built by{" "}
            <a
              href="https://29cloudworks.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              29CloudWorks
            </a>
          </p> */}
        </div>
      </div>
    </footer>
  );
}