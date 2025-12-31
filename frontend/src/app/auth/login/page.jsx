"use client";
import { useAuthStore } from "@/store/useAuthStore";
import AuthForm from "@/components/auth/AuthForm";
import { useRouter } from "next/navigation";
import RedirectIfAuthed from "@/components/auth/RedirectIfAuthed";

export default function LoginPage() {
  const { signIn } = useAuthStore();
  const router = useRouter();

  async function handleLogin({ email, password }) {
    const user = await signIn(email, password);
    user ? router.push('/') : router.push('/auth/login')
  }

  return (
    <RedirectIfAuthed>
      <AuthForm mode="login" onSubmit={handleLogin} />
    </RedirectIfAuthed>
  );
}
