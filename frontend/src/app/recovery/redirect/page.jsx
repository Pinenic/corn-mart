"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RecoveryPage() {
  const router = useRouter();

  useEffect(() => {
    // Hash is only available client-side
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");

    if (!access_token) {
        toast.error("There was a problem with the link, please try again later");
      router.push("/auth/login"); // route to be added later (?error=invalid_recovery_link)
      return;
    }

    // Forward token to your backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/recovery`, {
      method: "POST",
      credentials: "include", // important: allows cookie to be set
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token }),
    })
      .then((res) => {
        console.log(res);
        if (res.redirected) {
          window.location.href = res.url;
        } else {
          router.push("/recovery/reset-password");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong, please try again later");
        router.push("/auth/login"); // route to be added later (?error=recovery_failed)
      });
  }, []);

  return <p>Redirecting, please wait...</p>;
}
