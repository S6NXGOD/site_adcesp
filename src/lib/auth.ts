import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Sessão longa: o token só expira após 30 dias SEM uso. Cada acesso dentro
// desse período renova o prazo (rolling), então, usando o painel com alguma
// regularidade, o usuário só sai quando clicar em "Sair".
const TRINTA_DIAS = 30 * 24 * 60 * 60; // segundos

// De quanto em quanto tempo revalidar papel/módulos no banco. Fora disso, a
// sessão usa o que já está no token — assim a navegação não depende do banco.
const REFRESH_MS = 5 * 60 * 1000; // 5 minutos

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: TRINTA_DIAS,
    updateAge: 24 * 60 * 60, // renova o cookie no máximo 1x/dia de uso
  },
  jwt: { maxAge: TRINTA_DIAS },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!usuario || !usuario.ativo) return null;

        const senhaValida = await bcrypt.compare(
          credentials.senha,
          usuario.senha
        );
        if (!senhaValida) return null;

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          modulos: usuario.modulos,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Login: grava os dados no token.
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.modulos = (user as { modulos: string[] }).modulos ?? [];
        token.refreshedAt = Date.now();
        return token;
      }

      // Revalidação: reconsulta o banco no máximo a cada REFRESH_MS, para a
      // navegação normal não bater no banco a cada request.
      const ultimo = (token.refreshedAt as number) ?? 0;
      if (token.id && Date.now() - ultimo > REFRESH_MS) {
        try {
          const atual = await prisma.usuario.findUnique({
            where: { id: token.id as string },
            select: { role: true, modulos: true, nome: true },
          });
          if (atual) {
            token.role = atual.role;
            token.modulos = atual.modulos;
            token.name = atual.nome;
          }
          token.refreshedAt = Date.now();
        } catch {
          // Falha transitória do banco NÃO desloga o usuário: mantém o token
          // atual e tenta de novo no próximo ciclo. Esta era a causa dos
          // logouts "aleatórios" em produção.
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.modulos = (token.modulos as string[]) ?? [];
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
