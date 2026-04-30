"use client";
import { useState } from "react";
import { Users, ShieldCheck, Heart, MapPin, Share2 } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { toast } from "@/lib/store/toastStore";
import { marketplaceStoreService } from "@/lib/api/services";
import useAuthStore from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";

export function StorefrontHeader({ store, onFollowChange }) {
  const token        = useAuthStore(s => s.token);
  const [following, setFollowing] = useState(store?.is_following ?? false);
  const [followers, setFollowers] = useState(store?.followers_count ?? 0);
  const [loading, setLoading]     = useState(false);

  const handleFollow = async () => {
    if (!token) { toast.info("Sign in to follow stores"); return; }
    setLoading(true);
    try {
      if (following) {
        await marketplaceStoreService.unfollow(store.id);
        setFollowing(false);
        setFollowers(f => Math.max(0, f - 1));
        toast.info("Unfollowed");
      } else {
        await marketplaceStoreService.follow(store.id);
        setFollowing(true);
        setFollowers(f => f + 1);
        toast.success(`Following ${store.name}`);
      }
      onFollowChange?.(!following);
    } catch (err) {
      toast.error("Could not update follow status");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied!");
  };

  if (!store) return null;

  // Placeholder storefront accent — this will come from store branding in DB
  const accentColor = "#0057ff";

  return (
    <div className="bg-white border-b border-[var(--color-border)] mb-6">
      {/* Banner */}
      <div className="h-40 md:h-56 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}06 100%)` }}>
        {store.banner
          ? <img src={store.banner} alt="" className="w-full h-full object-cover" />
          : (
            // Placeholder decorative pattern
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10" style={{ background: accentColor }} />
              <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full opacity-5" style={{ background: accentColor }} />
            </div>
          )
        }
      </div>

      {/* Profile row */}
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-end gap-4 -mt-8 mb-4">
          {/* Logo */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden flex-shrink-0 bg-white">
            {store.logo
              ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl font-bold text-white" style={{ background: accentColor }}>
                  {store.name?.[0]}
                </div>
            }
          </div>

          {/* Name + actions */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-[18px] md:text-[22px] font-bold text-[var(--color-text-primary)]">{store.name}</h1>
              {store.is_verified && (
                <div className="flex items-center gap-1 text-[var(--color-primary)]">
                  <ShieldCheck size={16} />
                  <span className="text-[11px] font-semibold">Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pb-1 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant={following ? "secondary" : "primary"}
              size="sm"
              loading={loading}
              onClick={handleFollow}
            >
              <Heart size={13} fill={following ? "currentColor" : "none"} />
              {following ? "Following" : "Follow"}
            </Button>
          </div>
        </div>

        {/* Description + stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4">
          <div className="flex-1 min-w-0">
            {store.description && (
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed max-w-xl">{store.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4 text-[12px] text-[var(--color-text-secondary)] flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Users size={13} style={{ color: accentColor }} />
              <span><strong className="text-[var(--color-text-primary)]">{followers.toLocaleString()}</strong> followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
