"use client";

import { useState } from "react";
import {
  Store, Bell, CreditCard, Shield, User, LogOut,
  Globe, Truck, ChevronRight, ChevronDown, Check,
  Plus, Trash2, Eye, EyeOff, AlertTriangle, Copy,
  Smartphone, Mail, Lock, Package
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";

// ── Reusable primitives ───────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className="relative flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ width: 36, height: 20, background: value ? "var(--color-accent)" : "var(--color-border-md)" }}
    >
      <span
        className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white transition-transform duration-200"
        style={{ transform: value ? "translateX(3px)" : "translateX(-16px)" }}
      />
    </button>
  );
}

function SettingsSection({ title, children }) {
  return (
    <div className="mb-5">
      {title && (
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-0.5"
          style={{ color: "var(--color-text-tertiary)" }}>
          {title}
        </p>
      )}
      <Card noPadding className="overflow-hidden divide-y" style={{ borderColor: "var(--color-border)" }}>
        {children}
      </Card>
    </div>
  );
}

// A row that expands an inline form when clicked
function ExpandableRow({ icon: Icon, label, value, badge, danger, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--color-bg)]"
        style={{ color: danger ? "var(--color-danger)" : "var(--color-text-primary)" }}
      >
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: danger ? "var(--color-danger-bg)" : "var(--color-bg)",
              color:      danger ? "var(--color-danger)"    : "var(--color-text-secondary)",
            }}>
            <Icon size={14} />
          </div>
        )}
        <span className="flex-1 text-[13.5px] font-medium">{label}</span>
        {badge && <Badge variant="warning">{badge}</Badge>}
        {value && (
          <span className="text-[12px] mr-1" style={{ color: "var(--color-text-tertiary)" }}>{value}</span>
        )}
        {open
          ? <ChevronDown size={15} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
          : <ChevronRight size={15} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, description, value, onChange }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {Icon && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--color-bg)", color: "var(--color-text-secondary)" }}>
          <Icon size={14} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium" style={{ color: "var(--color-text-primary)" }}>{label}</p>
        {description && (
          <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{description}</p>
        )}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function InlineField({ label, children }) {
  return (
    <div className="mb-3">
      <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]";
const inputStyle = { borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" };

function SaveBtn({ onClick }) {
  const [saved, setSaved] = useState(false);
  const handle = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); onClick?.(); };
  return (
    <button onClick={handle}
      className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-[12px] font-semibold text-white transition-colors mt-3"
      style={{ background: "var(--color-accent)" }}>
      {saved ? <><Check size={12} /> Saved</> : "Save changes"}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function SettingsPage() {
  // Notification toggles
  const [notifs, setNotifs] = useState({
    new_orders:    true,
    messages:      true,
    low_stock:     false,
    weekly_email:  true,
    promo_tips:    false,
    order_shipped: true,
    refunds:       true,
  });

  // 2FA
  const [twofa, setTwofa]           = useState(true);
  // const [showApiKey, setShowApiKey] = useState(false);

  // Payment methods
  const [payMethods] = useState([
    { id: "pm1", type: "Visa",       last4: "4291", expiry: "08/27", primary: true  },
    { id: "pm2", type: "Mastercard", last4: "7732", expiry: "12/26", primary: false },
  ]);

  // Shipping zones
  const [zones] = useState([
    { id: "z1", name: "Domestic (US)",       rate: "Free over $50 · $5.99 standard" },
    { id: "z2", name: "North America",        rate: "$12.99 flat rate"               },
    { id: "z3", name: "International",        rate: "$24.99 flat rate"               },
  ]);

  // Sessions
  const [sessions] = useState([
    { id: "s1", device: "MacBook Pro — Chrome",  location: "San Francisco, CA", current: true,  lastSeen: "Now"           },
    { id: "s2", device: "iPhone 15 — Safari",    location: "San Francisco, CA", current: false, lastSeen: "2 hours ago"   },
    { id: "s3", device: "Windows PC — Firefox",  location: "New York, NY",      current: false, lastSeen: "3 days ago"    },
  ]);

  const toggleNotif = (key) => setNotifs((n) => ({ ...n, [key]: !n[key] }));

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your store preferences and account"
      />

      {/* Profile card */}
      <Card className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
          style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent-text)" }}>
          SK
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Store Admin</p>
          <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>admin@storely.com</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="success">Pro plan</Badge>
          <Button variant="secondary" size="sm">Manage plan</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Store */}
          <SettingsSection title="Store">
            <ExpandableRow icon={Store} label="Store name" value="Corn Mart Shop">
              <InlineField label="Store name">
                <input defaultValue="Corn Mart Shop" className={inputCls} style={inputStyle} />
              </InlineField>
              <InlineField label="Store description">
                <textarea defaultValue="Premium lifestyle products curated for the modern shopper." rows={2}
                  className={`${inputCls} h-auto resize-none py-2`} style={inputStyle} />
              </InlineField>
              <SaveBtn />
            </ExpandableRow>

            <ExpandableRow icon={Globe} label="Currency" value="USD ($)">
              <InlineField label="Currency">
                <select className={`${inputCls} cursor-pointer`} style={inputStyle} defaultValue="USD">
                  {[["USD","US Dollar ($)"],["GBP","British Pound (£)"],["EUR","Euro (€)"],["GHS","Ghanaian Cedi (₵)"],["CAD","Canadian Dollar (C$)"]].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </InlineField>
              <InlineField label="Currency format">
                <select className={`${inputCls} cursor-pointer`} style={inputStyle}>
                  <option>$1,234.56</option>
                  <option>1.234,56 $</option>
                  <option>$ 1 234.56</option>
                </select>
              </InlineField>
              <SaveBtn />
            </ExpandableRow>

            <ExpandableRow icon={Globe} label="Timezone" value="UTC+0">
              <InlineField label="Timezone">
                <select className={`${inputCls} cursor-pointer`} style={inputStyle}>
                  <option>UTC+0 — London</option>
                  <option>UTC-5 — New York</option>
                  <option>UTC-8 — Los Angeles</option>
                  <option>UTC+0 — Accra</option>
                  <option>UTC+1 — Lagos</option>
                </select>
              </InlineField>
              <SaveBtn />
            </ExpandableRow>

            <ExpandableRow icon={Globe} label="Language" value="English">
              <InlineField label="Dashboard language">
                <select className={`${inputCls} cursor-pointer`} style={inputStyle}>
                  <option>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>Português</option>
                </select>
              </InlineField>
              <SaveBtn />
            </ExpandableRow>
          </SettingsSection>

          {/* Shipping */}
          <SettingsSection title="Shipping & fulfilment">
            <ExpandableRow icon={Truck} label="Shipping zones" value={`${zones.length} zones`}>
              <div className="space-y-2 mt-1 mb-3">
                {zones.map((z) => (
                  <div key={z.id} className="flex items-start gap-2 p-3 rounded-xl border"
                    style={{ borderColor: "var(--color-border)", background: "white" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{z.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{z.rate}</p>
                    </div>
                    <button className="text-[11px] font-medium" style={{ color: "var(--color-accent)" }}>Edit</button>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1.5 text-[12px] font-medium"
                style={{ color: "var(--color-accent)" }}>
                <Plus size={13} /> Add zone
              </button>
            </ExpandableRow>

            <ExpandableRow icon={Package} label="Free shipping threshold" value="$50">
              <InlineField label="Free shipping on orders over ($)">
                <input type="number" defaultValue={50} min={0}
                  className={inputCls} style={inputStyle} />
              </InlineField>
              <InlineField label="Standard shipping rate ($)">
                <input type="number" defaultValue={5.99} min={0} step={0.01}
                  className={inputCls} style={inputStyle} />
              </InlineField>
              <SaveBtn />
            </ExpandableRow>

            <ExpandableRow icon={Truck} label="Delivery estimates" value="2–5 days">
              <InlineField label="Estimated delivery (business days)">
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={2} min={1} max={30}
                    className={`${inputCls} flex-1`} style={inputStyle} />
                  <span className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>to</span>
                  <input type="number" defaultValue={5} min={1} max={30}
                    className={`${inputCls} flex-1`} style={inputStyle} />
                </div>
              </InlineField>
              <SaveBtn />
            </ExpandableRow>
          </SettingsSection>

          {/* Payments */}
          <SettingsSection title="Payments">
            <ExpandableRow icon={CreditCard} label="Payment methods" value={`${payMethods.length} active`}>
              <div className="space-y-2 mt-1 mb-3">
                {payMethods.map((pm) => (
                  <div key={pm.id} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ borderColor: "var(--color-border)", background: "white" }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          {pm.type} •••• {pm.last4}
                        </p>
                        {pm.primary && <Badge variant="success">Primary</Badge>}
                      </div>
                      <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                        Expires {pm.expiry}
                      </p>
                    </div>
                    <button className="text-[11px]" style={{ color: "var(--color-danger)" }}>Remove</button>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1.5 text-[12px] font-medium"
                style={{ color: "var(--color-accent)" }}>
                <Plus size={13} /> Add payment method
              </button>
            </ExpandableRow>

            <ExpandableRow icon={CreditCard} label="Payout account" value="Bank ••4291">
              <div className="p-3 rounded-xl border mb-3"
                style={{ borderColor: "var(--color-border)", background: "white" }}>
                <p className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  Chase Business Checking
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                  Account ending in 4291 · Payouts every Monday
                </p>
              </div>
              <button className="text-[12px] font-medium" style={{ color: "var(--color-accent)" }}>
                Change payout account →
              </button>
            </ExpandableRow>

            <ExpandableRow icon={AlertTriangle} label="Tax settings" badge="Action needed">
              <div className="p-3 rounded-xl border mb-3"
                style={{ borderColor: "var(--color-warning)", background: "var(--color-warning-bg)" }}>
                <p className="text-[12px] font-semibold mb-0.5" style={{ color: "var(--color-warning)" }}>
                  Tax registration required
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                  Add your VAT or sales tax number to comply with local regulations.
                </p>
              </div>
              <InlineField label="VAT / Tax number">
                <input placeholder="e.g. GB123456789" className={inputCls} style={inputStyle} />
              </InlineField>
              <InlineField label="Tax collection">
                <select className={`${inputCls} cursor-pointer`} style={inputStyle}>
                  <option>Collect tax automatically</option>
                  <option>I handle tax manually</option>
                  <option>Tax included in prices</option>
                </select>
              </InlineField>
              <SaveBtn />
            </ExpandableRow>
          </SettingsSection>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          {/* Notifications */}
          <SettingsSection title="Notifications">
            <ToggleRow icon={Bell} label="New orders" description="Get alerted when a new order is placed"
              value={notifs.new_orders} onChange={() => toggleNotif("new_orders")} />
            <ToggleRow icon={Mail} label="Customer messages" description="Inbox messages from customers"
              value={notifs.messages} onChange={() => toggleNotif("messages")} />
            <ToggleRow icon={Package} label="Low stock alerts" description="When a variant hits its threshold"
              value={notifs.low_stock} onChange={() => toggleNotif("low_stock")} />
            <ToggleRow icon={Truck} label="Order shipped" description="Confirm when orders go out"
              value={notifs.order_shipped} onChange={() => toggleNotif("order_shipped")} />
            <ToggleRow icon={CreditCard} label="Refund activity" description="When refunds are initiated or completed"
              value={notifs.refunds} onChange={() => toggleNotif("refunds")} />
            <ToggleRow icon={Mail} label="Weekly summary email" description="Revenue and order recap every Monday"
              value={notifs.weekly_email} onChange={() => toggleNotif("weekly_email")} />
            <ToggleRow icon={Bell} label="Promotional tips" description="Suggestions from Corn Mart"
              value={notifs.promo_tips} onChange={() => toggleNotif("promo_tips")} />
          </SettingsSection>

          {/* Account & security */}
          <SettingsSection title="Account & security">
            <ExpandableRow icon={User} label="Email address" value="admin@storely.com">
              <InlineField label="Current email">
                <input type="email" defaultValue="admin@storely.com" className={inputCls} style={inputStyle} />
              </InlineField>
              <InlineField label="New email">
                <input type="email" placeholder="Enter new email" className={inputCls} style={inputStyle} />
              </InlineField>
              <InlineField label="Confirm password">
                <input type="password" placeholder="Enter your password" className={inputCls} style={inputStyle} />
              </InlineField>
              <SaveBtn />
            </ExpandableRow>

            <ExpandableRow icon={Lock} label="Password" value="Last changed 30d ago">
              <InlineField label="Current password">
                <input type="password" placeholder="Enter current password" className={inputCls} style={inputStyle} />
              </InlineField>
              <InlineField label="New password">
                <input type="password" placeholder="Min. 8 characters" className={inputCls} style={inputStyle} />
              </InlineField>
              <InlineField label="Confirm new password">
                <input type="password" placeholder="Confirm new password" className={inputCls} style={inputStyle} />
              </InlineField>
              <SaveBtn />
            </ExpandableRow>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-bg)", color: "var(--color-text-secondary)" }}>
                <Smartphone size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                  Two-factor authentication
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {twofa ? "Enabled via authenticator app" : "Strongly recommended"}
                </p>
              </div>
              <Toggle value={twofa} onChange={setTwofa} />
            </div>

            <ExpandableRow icon={Shield} label="Active sessions" value={`${sessions.length} devices`}>
              <div className="space-y-2 mt-1">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl border"
                    style={{ borderColor: s.current ? "var(--color-accent)" : "var(--color-border)", background: "white" }}>
                    <Smartphone size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {s.device}
                        {s.current && <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent-text)" }}>This device</span>}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                        {s.location} · {s.lastSeen}
                      </p>
                    </div>
                    {!s.current && (
                      <button className="text-[11px] font-medium flex-shrink-0" style={{ color: "var(--color-danger)" }}>
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
                <button className="text-[12px] font-medium mt-1" style={{ color: "var(--color-danger)" }}>
                  Sign out all other devices
                </button>
              </div>
            </ExpandableRow>
          </SettingsSection>

          {/* Danger zone */}
          <SettingsSection title="Account">
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--color-danger-bg)]"
              style={{ color: "var(--color-danger)" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
                <LogOut size={14} />
              </div>
              <span className="flex-1 text-[13.5px] font-medium">Sign out</span>
            </button>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
