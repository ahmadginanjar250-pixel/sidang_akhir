import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Ambil user sekaligus dengan relasi lulusan & perusahaan dalam 1 query
        // Menggantikan 2 query terpisah sebelumnya (user + role detail)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            nama: true,
            lulusan: { select: { nama: true } },
            perusahaan: { select: { nama: true } },
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        // Tentukan nama berdasarkan role (tidak perlu query DB lagi)
        let name = user.email;
        if (user.role === "LULUSAN" && user.lulusan) {
          name = user.lulusan.nama;
        } else if (user.role === "PERUSAHAAN" && user.perusahaan) {
          name = user.perusahaan.nama;
        } else if (user.role === "ADMIN" || user.role === "KEPALA_SEKOLAH") {
          name = user.nama || user.email;
        }

        return { id: user.id, email: user.email, role: user.role, name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 jam
  },
  secret: process.env.NEXTAUTH_SECRET,
};
