"use client";
import { useAuthStore } from "@/store/useAuthStore";
import AuthForm from "@/components/auth/AuthForm";
import { createUserFolder } from "@/app/actions/signupAction";
import { createProfile } from "@/app/actions/profileAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { signUp } = useAuthStore();
  const router = useRouter();

  async function handleSignup({ email, password, firstname, lastname, phone }) {
    const user = await signUp(email, password, firstname, lastname, phone);
    const encoded = encodeURIComponent(firstname + " " + lastname);
    const url = `https://api.dicebear.com/9.x/initials/svg?seed=${encoded}&backgroundColor=c5c5c5&textColor=ffffff`;
    if (user) {
      await createUserFolder(user.id);
      await createProfile(user, url, phone);
      toast.success("Signup successful! Folder created. You can now log in.");
      router.push("/");
    }
  }

  return <AuthForm mode="signup" onSubmit={handleSignup} />;
}
