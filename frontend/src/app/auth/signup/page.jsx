"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import AuthForm from "@/components/auth/AuthForm";
import { createUserFolder } from "@/app/actions/signupAction";
import { createProfile } from "@/app/actions/profileAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingOverlay from "@/components/loading-overlay";
import RedirectIfAuthed from "@/components/auth/RedirectIfAuthed";

export default function SignupPage() {
  useEffect(() => {
    document.title = 'Sign Up | Corn Mart';
  }, []);
  const { signUp, signIn } = useAuthStore();
  const [userLoading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup({ email, password, firstname, lastname, phone }) {
    const user = await signUp(email, password, firstname, lastname, phone);
    const encoded = encodeURIComponent(firstname + " " + lastname);
    const url = `https://api.dicebear.com/9.x/initials/svg?seed=${encoded}&backgroundColor=c5c5c5&textColor=ffffff`;
    if (user) {
      await createUserFolder(user.id);
      await createProfile(user, url, phone);
      // toast.success("Signup successful! Folder created. Now loggin in.");
      setLoading(true);
      setTimeout(async () => {
        const logged_in_user = await signIn(email, password);
        setLoading(false);
        // alert("Welcome back!");
        logged_in_user ? router.push("/") : router.push("/auth/login");
      }, 5000);
      // router.push("/");
    }
  }
  if (userLoading) return <LoadingOverlay show={userLoading} />;

  return (
    <RedirectIfAuthed>
      <AuthForm mode="signup" onSubmit={handleSignup} />
    </RedirectIfAuthed>
  );
}
