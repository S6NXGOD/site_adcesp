import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { podeAcessarRota } from "@/lib/admin-modules";

// Protege o painel: exige login e valida a permissão de módulo do usuário.
// - Sem sessão  -> redireciona para /admin/login (authorized: false).
// - Logado sem permissão de módulo -> redireciona para /admin/dashboard.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    if (
      token &&
      !podeAcessarRota(
        (token.role as string) ?? "EDITOR",
        (token.modulos as string[]) ?? [],
        req.nextUrl.pathname
      )
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/admin/login" },
  }
);

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/noticias/:path*",
    "/admin/imprensa/:path*",
    "/admin/artigos/:path*",
    "/admin/videos/:path*",
    "/admin/eventos/:path*",
    "/admin/transparencia/:path*",
    "/admin/filiacoes/:path*",
    "/admin/coordenacoes/:path*",
    "/admin/diretorias/:path*",
    "/admin/institucional/:path*",
    "/admin/eleicoes/:path*",
    "/admin/servicos/:path*",
    "/admin/popup/:path*",
    "/admin/contato/:path*",
    "/admin/configuracoes/:path*",
    "/admin/usuarios/:path*",
  ],
};
