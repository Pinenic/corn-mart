"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { followStore, isFollowingStore, unfollowStore } from "@/lib/storesApi";

export default function FollowButton({
  storeId,
  refresh,
  initialFollowing = false,
  size = "md",
  variant = "default",
  className = "",
}) {
  const { init, user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  /* -------- Fetch follow state on mount -------- */
  useEffect(() => {
    if (!storeId || !user) return;

    const checkFollow = async () => {
      try {
        const res = await isFollowingStore(user?.id, storeId);

        // const data = await res.json();
        setIsFollowing(res.isFollowing);
        // console.log(res.isFollowing)
      } catch (err) {
        console.error(err);
      }
    };

    checkFollow();
  }, [storeId, user]);

  /* -------- Toggle follow -------- */
  const toggleFollow = async () => {
    try {
      setLoading(true);
      await init();
      console.log(storeId)

      const method = isFollowing ? "DELETE" : "POST";

      // optimistic update
      setIsFollowing((prev) => !prev);

      //   const res = await fetch(
      //     `/api/stores/${storeId}/follow`,
      //     {
      //       method,
      //       headers: {
      //         Authorization: `Bearer ${user.access_token}`,
      //       },
      //     }
      //   );

      //   if (!res.ok) {
      //     throw new Error("Request failed");
      //   }

      if (isFollowing) {
        const res = await unfollowStore(user.id, storeId);
        res.followed == false
          ? console.log("unfollowed")
          : console.log("Request failed");
      } else {
        const res = await followStore(user.id, storeId);
        res.followed == true
          ? console.log("followed")
          : console.log("Request failed");
      }

      toast.success(isFollowing ? "Unfollowed store" : "Following store");
    } catch (error) {
      // rollback optimistic update
      setIsFollowing((prev) => !prev);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      refresh();
    }
  };

  /* -------- Styling helpers -------- */
  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = isFollowing
    ? "bg-muted text-foreground hover:bg-muted/80"
    : "bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`
        rounded-full font-medium transition
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses}
        ${className}
      `}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
