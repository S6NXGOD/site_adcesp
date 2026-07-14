import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Acesso Administrativo",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo variant="white" className="h-16 w-auto" />
          <p className="mt-4 text-sm text-slate-400">Painel Administrativo</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-xl">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Acesso restrito à diretoria e administradores autorizados.
        </p>
      </div>
    </div>
  );
}
